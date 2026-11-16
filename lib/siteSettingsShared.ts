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
}

// Used until an admin saves the Settings page for the first time.
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  portalName: 'Ghana National Union of Technical Students (GNUTS)',
  secretariatEmail: 'info@gnuts.org.gh',
  hotlinePhone: '+233 (0) 302 987 654',
  mobilePhone: '+233 24 316 3135',
  headquartersAddress: 'Accra Technical University Campus, Barnes Road, Accra, Ghana',
  postalAddress: 'P.O. Box GP 2329, Accra - Ghana',
  facebookUrl: 'https://facebook.com/gnutsonline',
  twitterUrl: 'https://twitter.com/gnutsonline',
  instagramUrl: 'https://instagram.com/gnutsonline',
  tiktokUrl: 'https://tiktok.com/@gnutsonline',
  linkedinUrl: '',
  youtubeUrl: '',
};

/** "+233 (0) 302 987 654" -> "tel:+233302987654" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\(0\)/g, '').replace(/[^+\d]/g, '')}`;
}

/** "+233 24 316 3135" -> "https://wa.me/233243163135" */
export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\(0\)/g, '').replace(/\D/g, '')}`;
}
