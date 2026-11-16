/**
 * Password hashing with Node's built-in scrypt (no extra dependency).
 * Server-only: do not import from middleware or client components.
 *
 * Stored format: scrypt$<saltHex>$<hashHex>
 */
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

const KEY_LENGTH = 64;
const PREFIX = 'scrypt$';

/**
 * Passwords that have been published in this repository's seed data or old code.
 * Accounts still using one of these cannot log in in production.
 */
export const KNOWN_DEFAULT_PASSWORDS = new Set(['password123', 'admin123', 'gnuts2026!']);

export const MIN_PASSWORD_LENGTH = 8;

export function isHashed(stored: string | null | undefined): boolean {
  return typeof stored === 'string' && stored.startsWith(PREFIX);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH);
  return `${PREFIX}${salt.toString('hex')}$${hash.toString('hex')}`;
}

function safeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Checks a password against a stored value. Supports scrypt hashes and,
 * for accounts created before hashing was added, legacy plain-text values.
 */
export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored || !password) return false;

  if (isHashed(stored)) {
    const [, saltHex, hashHex] = stored.split('$');
    if (!saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, 'hex');
    const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  return safeEqualStrings(password, stored);
}

/** Returns an error message if the password is unacceptable for a new/changed account. */
export function validateNewPassword(password: string): string | null {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (KNOWN_DEFAULT_PASSWORDS.has(password)) {
    return 'That password is publicly known. Please choose a different one.';
  }
  return null;
}
