import type { SiteSettings } from '@/lib/siteSettingsShared';
import { absoluteUrl, SITE_URL } from '@/lib/siteUrl';

/**
 * Schema.org data that tells Google who GNUTS is: the official name, the
 * "GNUTS" abbreviation, logo, contact details and official social profiles.
 * This feeds the site name shown in search results and the knowledge panel.
 * Contact details and social links come from Admin > Settings.
 */
export default function StructuredData({ settings }: { settings: SiteSettings }) {
  const sameAs = [
    settings.facebookUrl,
    settings.twitterUrl,
    settings.instagramUrl,
    settings.tiktokUrl,
    settings.linkedinUrl,
    settings.youtubeUrl,
  ].filter((url) => typeof url === 'string' && /^https?:\/\//.test(url));

  const phones = [settings.hotlinePhone, settings.mobilePhone].filter(Boolean);

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Ghana National Union of Technical Students',
    // GNUTS and its spellings, plus the former name GNUPS (before polytechnics became technical universities)
    alternateName: ['GNUTS', 'G.N.U.T.S.', 'GNUTS Ghana', 'Ghana National Union of Polytechnic Students', 'GNUPS'],
    foundingDate: '1987',
    slogan: 'Professionals with Integrity',
    url: absoluteUrl('/'),
    logo: absoluteUrl('/images/gnuts_logo.png'),
    image: absoluteUrl('/images/carousel_1.jpg'),
    description:
      'The Ghana National Union of Technical Students (GNUTS) is the national representative body of students in Technical Universities and TVET institutions across Ghana.',
    email: settings.secretariatEmail || undefined,
    telephone: settings.hotlinePhone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.headquartersAddress || undefined,
      postOfficeBoxNumber: settings.postalAddress || undefined,
      addressLocality: 'Accra',
      addressCountry: 'GH',
    },
    areaServed: { '@type': 'Country', name: 'Ghana' },
    contactPoint: phones.map((telephone) => ({
      '@type': 'ContactPoint',
      telephone,
      email: settings.secretariatEmail || undefined,
      contactType: 'customer support',
      areaServed: 'GH',
      availableLanguage: ['English'],
    })),
    sameAs,
  };

  // Lets Google show "GNUTS" as the site name above the result
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'GNUTS',
    alternateName: ['Ghana National Union of Technical Students', 'G.N.U.T.S.', 'GNUTS Ghana'],
    url: absoluteUrl('/'),
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-GH',
  };

  // "<" is escaped so content from settings can never close the script tag
  const json = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(website) }} />
    </>
  );
}
