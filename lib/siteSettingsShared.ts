// Site settings types and defaults. Safe to import from client components
// (no database or Node-only imports here; see lib/siteSettings.ts for those).

export interface SiteSettings {
  portalName: string;
  secretariatEmail: string;
  /** Main office line */
  hotlinePhone: string;
  /** Mobile / WhatsApp number. Empty hides it. */
  mobilePhone: string;
  headquartersAddress: string;
  /** P.O. Box. Empty hides it. */
  postalAddress: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  /** Years of advocacy as entered by an admin in `countersYear` (e.g. "34"). Counts up every January. */
  advocacyYears: string;
  /** Current administration number as entered by an admin in `countersYear` (e.g. "34" = 34th). Counts up every January. */
  administrationNumber: string;
  /** Calendar year in which the two numbers above were last set (e.g. "2026"). */
  countersYear: string;
}

// Used until an admin saves the Settings page for the first time.
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  portalName: 'Ghana National Union of Technical Students (GNUTS)',
  secretariatEmail: 'info@gnuts.org.gh',
  hotlinePhone: '+233 (0) 302 987 654',
  mobilePhone: '+233 24 316 3135',
  headquartersAddress: 'Ho Technical University, Ho, Volta Region, Ghana',
  postalAddress: 'P.O. Box GP 2329, Accra - Ghana',
  // Official GNUTS LIVE accounts
  facebookUrl: 'https://www.facebook.com/gnutslive/',
  twitterUrl: 'https://x.com/GNUTS_LIVE',
  instagramUrl: 'https://www.instagram.com/gnutslive_/',
  // Empty hides the icon; add the GNUTS Live TikTok link in Admin > Settings
  tiktokUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  advocacyYears: '34',
  administrationNumber: '34',
  countersYear: '2026',
};

function toInt(value: string, fallback: number): number {
  const n = parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Whole calendar years since an admin last set the counters (0 in the same year). */
function yearsSinceSet(settings: SiteSettings): number {
  const setIn = toInt(settings.countersYear, new Date().getFullYear());
  return Math.max(0, new Date().getFullYear() - setIn);
}

/** Years of advocacy shown on the site: 34 in 2026, 35 in 2027, and so on. */
export function currentAdvocacyYears(settings: SiteSettings): number {
  return toInt(settings.advocacyYears, 34) + yearsSinceSet(settings);
}

/** Current administration number: 34 in 2026, 35 in 2027, and so on. */
export function currentAdministrationNumber(settings: SiteSettings): number {
  return toInt(settings.administrationNumber, 34) + yearsSinceSet(settings);
}

/** 34 -> "34th", 41 -> "41st", 42 -> "42nd", 43 -> "43rd" */
export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  const suffix = ['th', 'st', 'nd', 'rd'][n % 10] || 'th';
  return `${n}${suffix}`;
}

/** "+233 (0) 302 987 654" -> "tel:+233302987654" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\(0\)/g, '').replace(/[^+\d]/g, '')}`;
}

/** "+233 24 316 3135" -> "https://wa.me/233243163135" */
export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\(0\)/g, '').replace(/\D/g, '')}`;
}
