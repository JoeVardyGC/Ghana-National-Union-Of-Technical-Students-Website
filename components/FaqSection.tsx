import { ChevronDown } from 'lucide-react';
import { getSiteSettings } from '@/lib/siteSettings';
import { SITE_URL } from '@/lib/siteUrl';

/**
 * "What is GNUTS?" questions on the home page.
 * The same list feeds the visible accordion and the FAQPage structured data,
 * giving Google clear answers to quote when someone searches for the union.
 * Contact details come from Admin > Settings.
 */
export default async function FaqSection() {
  const settings = await getSiteSettings();
  const domain = SITE_URL.replace(/^https?:\/\//, '');
  const phones = [settings.hotlinePhone, settings.mobilePhone].filter(Boolean).join(' or ');

  const faqs: { question: string; answer: string }[] = [
    {
      question: 'What is GNUTS?',
      answer:
        'GNUTS is the Ghana National Union of Technical Students, the national student body representing students of Technical Universities and Technical and Vocational Education and Training (TVET) institutions across Ghana.',
    },
    {
      question: 'What does GNUTS stand for?',
      answer: 'GNUTS stands for Ghana National Union of Technical Students.',
    },
    {
      question: 'Is GNUTS the same as groundnuts?',
      answer:
        'No. In Ghana, "G-nuts" is a common name for groundnuts (peanuts). GNUTS, written in capitals, is the Ghana National Union of Technical Students, the student union for technical and TVET students in Ghana.',
    },
    {
      question: 'What does GNUTS do?',
      answer:
        'GNUTS advocates for the welfare and academic interests of technical students, promotes quality technical and vocational education, shares scholarships and student opportunities, showcases student innovations, and brings Students’ Representative Councils (SRCs) of member institutions together at national level.',
    },
    {
      question: 'Who does GNUTS represent?',
      answer:
        'GNUTS represents students of its member Technical Universities and TVET institutions in Ghana, through the Students’ Representative Councils (SRCs) of those institutions.',
    },
    {
      question: 'What is the official GNUTS website?',
      answer: `The official website of the Ghana National Union of Technical Students is ${domain}.`,
    },
    {
      question: 'How can I contact GNUTS?',
      answer: [
        'You can reach the GNUTS National Secretariat',
        settings.secretariatEmail ? `by email at ${settings.secretariatEmail}` : '',
        phones ? `${settings.secretariatEmail ? 'or ' : ''}by phone on ${phones}` : '',
        `, or through the contact page on ${domain}.`,
      ]
        .filter(Boolean)
        .join(' ')
        .replace(' ,', ','),
    },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <section id="faq-section" className="py-16 sm:py-24 bg-white border-t border-gray-200" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 id="faq-heading" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#014900] tracking-tight uppercase">
            About GNUTS: Common Questions
          </h2>
          <div className="w-16 h-1.5 bg-[#D9A000] rounded-full mt-4 mx-auto" />
        </div>

        {/* Native <details>: works without JavaScript and with keyboards and screen readers */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group bg-[#f8f9fa] border border-gray-200 rounded-2xl open:bg-white open:shadow-md transition-shadow"
              open={index === 0}
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 sm:px-6 py-4 sm:py-5 [&::-webkit-details-marker]:hidden">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 group-open:text-[#014900]">{faq.question}</h3>
                <ChevronDown
                  className="w-5 h-5 text-[#014900] shrink-0 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-gray-700 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* "<" is escaped so text from settings can never close the script tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />
    </section>
  );
}
