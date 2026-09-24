import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAdminSession } from '@/lib/auth';
import { uploadToImageKit } from '@/lib/imagekit';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
]);

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customFolder = (formData.get('folder') as string | null) || '/gnuts_uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name || 'document.pdf';
    const fileType = (file.type || '').toLowerCase();
    const rawExt = path.extname(fileName).toLowerCase() || (fileType.includes('pdf') ? '.pdf' : '.jpg');

    const isMimeAllowed = !fileType || ALLOWED_MIME_TYPES.has(fileType) || fileType === 'application/octet-stream';
    const isExtAllowed = ALLOWED_EXTENSIONS.has(rawExt);

    if (!isMimeAllowed && !isExtAllowed) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: Images (JPG, PNG, WebP, GIF, SVG) and Documents (PDF, Word, Excel, PowerPoint).' },
        { status: 400 }
      );
    }

    // Validate File Size
    if (file.size && file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit. Please compress or optimize your file.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const baseName = path.basename(fileName, rawExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `${Date.now()}-${baseName || 'file'}${rawExt}`;
    const isDocument = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'].includes(rawExt) || fileType.includes('pdf');

    // 1. Try uploading to ImageKit.io CDN if configured
    const imagekitFolder = isDocument ? '/gnuts_documents' : customFolder;
    const imagekitResult = await uploadToImageKit(buffer, uniqueFileName, imagekitFolder);

    if (imagekitResult && imagekitResult.url) {
      return NextResponse.json({
        success: true,
        url: imagekitResult.url,
        fileName: fileName,
        file_name: fileName,
        size: file.size || buffer.length,
        provider: 'imagekit',
        isDocument,
      });
    }

    // 2. Fallback: Save file locally in public/uploads/
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, uniqueFileName);
      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${uniqueFileName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: fileName,
        file_name: fileName,
        size: file.size || buffer.length,
        provider: 'local',
        isDocument,
      });
    } catch (fsErr: any) {
      console.warn('Local filesystem write failed, using data-url fallback:', fsErr.message);
      const mime = fileType || (isDocument ? 'application/pdf' : 'image/jpeg');
      const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        fileName: fileName,
        file_name: fileName,
        size: file.size || buffer.length,
        provider: 'data-url',
        isDocument,
      });
    }
  } catch (error: any) {
    console.error('Admin upload error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to process file upload' 
    }, { status: 500 });
  }
}
