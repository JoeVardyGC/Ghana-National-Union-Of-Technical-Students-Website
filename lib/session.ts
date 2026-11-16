/**
 * Signed admin session tokens (HMAC-SHA256 via Web Crypto).
 *
 * Works in both the Node.js runtime (route handlers, server components) and
 * the Edge runtime (middleware), so it deliberately avoids Node's Buffer/crypto.
 *
 * Token format: base64url(JSON payload) + "." + base64url(HMAC signature)
 */
import type { AdminSessionUser } from './authTypes';

export const SESSION_COOKIE_NAME = 'gnuts_admin_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Used only outside production so `npm run dev` works without extra setup.
const DEV_FALLBACK_SECRET = 'gnuts-dev-only-session-secret-do-not-use-in-production';

interface SessionPayload extends AdminSessionUser {
  exp: number; // unix seconds
}

function getSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === 'production') {
    console.error('[auth] SESSION_SECRET is missing or shorter than 32 characters. Admin login is disabled.');
    return null;
  }
  return DEV_FALLBACK_SECRET;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/** Returns a signed token, or null if no SESSION_SECRET is configured in production. */
export async function createSessionToken(user: AdminSessionUser): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const payload: SessionPayload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const body = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await getKey(secret), encoder.encode(body));
  return `${body}.${bytesToBase64Url(new Uint8Array(sig))}`;
}

/** Verifies signature and expiry. Returns the session user, or null if invalid. */
export async function verifySessionToken(token: string | undefined | null): Promise<AdminSessionUser | null> {
  try {
    if (!token) return null;
    const secret = getSecret();
    if (!secret) return null;

    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [body, sig] = parts;

    const valid = await crypto.subtle.verify(
      'HMAC',
      await getKey(secret),
      base64UrlToBytes(sig) as BufferSource,
      encoder.encode(body)
    );
    if (!valid) return null;

    const payload = JSON.parse(decoder.decode(base64UrlToBytes(body))) as SessionPayload;
    if (!payload || typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    const { exp: _exp, ...user } = payload;
    return user;
  } catch {
    return null;
  }
}
