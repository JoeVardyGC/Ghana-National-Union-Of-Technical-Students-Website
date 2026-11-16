import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { uploadToImageKit } from '@/lib/imagekit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Public image upload, used by the student innovation submission form.
 * Restricted to raster images only (no SVG: it can carry scripts) and a fixed
 * destination folder. Signed-in admins may also choose a folder.
 * Documents and other admin uploads go through /api/admin/upload.
 */
const ALLOWED_IMAGE_TYPES: Record<string, string[]> = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.webp': ['image/webp'],
  '.gif': ['image/gif'],
};

const PUBLIC_MAX_BYTES = 5 * 1024 * 1024; // 5 MB for anonymous uploads
const ADMIN_MAX_BYTES = 25 * 1024 * 1024; // 25 MB for signed-in admins
const PUBLIC_FOLDER = '/gnuts_public_submissions';
const SAFE_FOLDER = /^\/[a-zA-Z0-9_-]{1,64}$/;

/** Checks the file's first bytes so a renamed HTML/script file can't pass as an image. */
function hasImageSignature(buf: Buffer, ext: string): boolean {
  if (ext === '.jpg' || ext === '.jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (ext === '.png') return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (ext === '.gif') return buf.subarray(0, 4).toString('ascii') === 'GIF8';
  if (ext === '.webp') return buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP';
  return false;
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    const maxBytes = session ? ADMIN_MAX_BYTES : PUBLIC_MAX_BYTES;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = path.extname(file.name || '').toLowerCase();
    const allowedMimes = ALLOWED_IMAGE_TYPES[ext];
    const fileType = (file.type || '').toLowerCase();

    if (!allowedMimes || (fileType && !allowedMimes.includes(fileType))) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed images: JPG, PNG, WebP, GIF.' },
        { status: 400 }
      );
    }

    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File size exceeds ${Math.round(maxBytes / 1024 / 1024)}MB limit.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!hasImageSignature(buffer, ext)) {
      return NextResponse.json({ error: 'The file does not look like a valid image.' }, { status: 400 });
    }

    const requestedFolder = formData.get('folder');
    const targetFolder =
      session && typeof requestedFolder === 'string' && SAFE_FOLDER.test(requestedFolder)
        ? requestedFolder
        : PUBLIC_FOLDER;

    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
    const uniqueFileName = `${Date.now()}-${baseName || 'image'}${ext}`;

    // 1. Try ImageKit CDN if configured
    const imagekitResult = await uploadToImageKit(buffer, uniqueFileName, targetFolder);
    if (imagekitResult && imagekitResult.url) {
      return NextResponse.json({
        success: true,
        url: imagekitResult.url,
        fileName: file.name,
        file_name: file.name,
        size: file.size,
        provider: 'imagekit',
        isDocument: false,
      });
    }

    // 2. Fallback: save locally in public/uploads/
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(path.join(uploadsDir, uniqueFileName), buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueFileName}`,
        fileName: uniqueFileName,
        size: file.size,
        provider: 'local',
      });
    } catch {
      // 3. Read-only/serverless environment: return a data URL (MIME taken from the validated extension)
      const mimeType = allowedMimes[0];
      return NextResponse.json({
        success: true,
        url: `data:${mimeType};base64,${buffer.toString('base64')}`,
        fileName: file.name,
        size: file.size,
        provider: 'data-url',
      });
    }
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image file' }, { status: 500 });
  }
}
