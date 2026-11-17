import sharp from 'sharp';
import { query } from '@/lib/db';

/**
 * GET /blog/:id/cover-image
 * Share-preview image for a news post (WhatsApp, Facebook, X, LinkedIn).
 *
 * Takes the post's cover photo/flyer and returns a light 1200x630 JPEG: the whole
 * cover centred on a blurred, darkened copy of itself. This keeps tall flyers and
 * wide photos fully visible, and stays well under WhatsApp's ~300 KB preview limit
 * (raw uploads can be several MB, which WhatsApp silently ignores).
 * Lives under /blog (not /api) so robots.txt allows crawlers to fetch it.
 */

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

function fallback(request: Request) {
  return Response.redirect(new URL('/images/og-logo.png', request.url), 302);
}

async function loadCover(image: string, request: Request): Promise<Buffer | null> {
  const value = image.trim();
  if (!value) return null;

  // Uploads stored inline as data URLs (fallback when the server can't save files)
  if (value.startsWith('data:image/')) {
    const comma = value.indexOf(',');
    return comma > 0 ? Buffer.from(value.slice(comma + 1), 'base64') : null;
  }

  // Remote (ImageKit/Cloudinary) or local (/uploads/...) image: fetch it over HTTP.
  // Local files are fetched from this same site, which also works on serverless hosts.
  const url = /^https?:\/\//.test(value) ? value : new URL(`/${value.replace(/^\/+/, '')}`, request.url).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const type = res.headers.get('content-type') || '';
  if (!type.startsWith('image/')) return null;
  const bytes = Buffer.from(await res.arrayBuffer());
  return bytes.length > 0 && bytes.length <= MAX_SOURCE_BYTES ? bytes : null;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const newsId = Number(id);
  if (!Number.isInteger(newsId) || newsId <= 0) return fallback(request);

  try {
    const rows = await query<{ id: number | string; image?: string | null; status?: string | null }>(
      'SELECT * FROM news WHERE id = ? LIMIT 1',
      [newsId]
    );
    const post = rows.find((row) => Number(row.id) === newsId);
    if (!post || String(post.status || 'published').toLowerCase() !== 'published' || !post.image) {
      return fallback(request);
    }

    const source = await loadCover(String(post.image), request);
    if (!source) return fallback(request);

    // Background: the cover stretched to fill, blurred and darkened
    const background = await sharp(source)
      .rotate()
      .resize(WIDTH, HEIGHT, { fit: 'cover' })
      .blur(28)
      .modulate({ brightness: 0.55 })
      .toBuffer();

    // Foreground: the whole cover, fitted inside the card with a small margin
    const foreground = await sharp(source)
      .rotate()
      .resize(WIDTH - 60, HEIGHT - 40, { fit: 'inside', withoutEnlargement: false })
      .toBuffer();

    const jpeg = await sharp(background)
      .composite([{ input: foreground, gravity: 'center' }])
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();

    return new Response(new Uint8Array(jpeg), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': String(jpeg.length),
        // Browsers 1 day; CDN 1 week, refreshed in the background
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Cover preview error:', error);
    return fallback(request);
  }
}
