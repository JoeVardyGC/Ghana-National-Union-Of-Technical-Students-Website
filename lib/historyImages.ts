/**
 * Photos for the About page's Union History Timeline.
 *
 * The timeline entries live in the database (Admin > About > Milestones). Entries that
 * still use one of the original stock placeholder pictures are shown with GNUTS's own
 * images below instead; any photo an admin uploads is always used as-is.
 */

export interface HistoryPhoto {
  url: string;
  /** "contain" shows the whole image (used for the logo) instead of filling the frame */
  fit?: 'cover' | 'contain';
}

// 1987 Establishment of GNUPS: GNUTS students (home page carousel photo)
const STUDENTS = { url: '/images/carousel_2.jpg' } satisfies HistoryPhoto;

// 2000 The Tamale Declaration: GNUTS delegates at the National Delegates Congress
const CONGRESS = {
  url: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
} satisfies HistoryPhoto;

// 2016 Transition from GNUPS to GNUTS: the GNUTS logo
const LOGO = { url: '/images/gnuts_logo.png', fit: 'contain' } satisfies HistoryPhoto;

// 2017 Public Recognition and Rebranding: GNUTS group photo (the page header background)
const GROUP = { url: '/images/header_for_pages.jpg' } satisfies HistoryPhoto;

/** Original placeholder picture (part of its URL) -> GNUTS image to show instead */
const REPLACEMENTS: [string, HistoryPhoto][] = [
  ['photo-1523240795612-9a054b0db644', STUDENTS],
  ['photo-1541829070764-84a7d30dd3f3', CONGRESS],
  ['photo-1581092160607-ee22621dd758', LOGO],
  ['choose_tvet_first_kwucvy', GROUP],
];

/** The image to show for a timeline entry. */
export function historyPhoto(image: string | null | undefined): HistoryPhoto | null {
  const value = String(image || '').trim();
  if (!value) return null;
  const replacement = REPLACEMENTS.find(([oldPart]) => value.includes(oldPart));
  if (replacement) return replacement[1];
  // An admin-uploaded logo should also show whole
  return { url: value, fit: /logo/i.test(value) ? 'contain' : 'cover' };
}
