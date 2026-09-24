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
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customFolder = (formData.get('folder') as string | null) || '/gnuts_innovations';

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate MIME Type
    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG images are allowed.' },
        { status: 400 }
      );
    }

    // Validate File Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds 15MB limit.' },
        { status: 400 }
      );
    }

    const rawExt = path.extname(file.name).toLowerCase() || '.jpg';
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { error: 'Invalid file extension.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const baseName = path.basename(file.name, rawExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `${Date.now()}-${baseName}${rawExt}`;

    // 1. Try uploading to ImageKit.io CDN if configured
    const imagekitResult = await uploadToImageKit(buffer, uniqueFileName, customFolder);

    if (imagekitResult && imagekitResult.url) {
      return NextResponse.json({
        success: true,
        url: imagekitResult.url,
        fileName: file.name || uniqueFileName,
        size: file.size,
        provider: 'imagekit',
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
