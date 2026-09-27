import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
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
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customFolder = (formData.get('folder') as string | null) || '/gnuts_uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name || 'document.pdf';
    const fileType = (file.type || '').toLowerCase();
    const rawExt = path.extname(fileName).toLowerCase() || (fileType.includes('pdf') ? '.pdf' : '.jpg');
    const isDocument = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'].includes(rawExt) || fileType.includes('pdf');

    // Validate MIME Type if provided
    if (fileType && !ALLOWED_MIME_TYPES.has(fileType) && fileType !== 'application/octet-stream') {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: Images (JPG, PNG, WebP, GIF, SVG) and Documents (PDF, Word, Excel, PowerPoint).' },
        { status: 400 }
      );
    }

    // Validate File Size
    if (file.size && file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { error: 'Invalid file extension. Allowed: .jpg, .jpeg, .png, .webp, .gif, .svg, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const baseName = path.basename(file.name, rawExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `${Date.now()}-${baseName || 'file'}${rawExt}`;
    const targetFolder = isDocument && customFolder === '/gnuts_uploads' ? '/gnuts_documents' : customFolder;

    // 1. Try uploading to ImageKit.io CDN if configured
    const imagekitResult = await uploadToImageKit(buffer, uniqueFileName, targetFolder);

    if (imagekitResult && imagekitResult.url) {
      return NextResponse.json({
        success: true,
        url: imagekitResult.url,
        fileName: file.name || uniqueFileName,
        file_name: file.name || uniqueFileName,
        size: file.size,
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

      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueFileName}`,
        fileName: uniqueFileName,
        size: file.size,
        provider: 'local',
      });
    } catch (fsErr) {
      // In serverless / read-only environment, fallback to base64 DataURL
      const mimeType = file.type || 'image/jpeg';
      const base64Str = `data:${mimeType};base64,${buffer.toString('base64')}`;
      return NextResponse.json({
        success: true,
        url: base64Str,
        fileName: file.name,
        size: file.size,
        provider: 'data-url',
      });
    }
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image file' }, { status: 500 });
  }
}
