import Link from 'next/link';
import { Landmark, Users, GraduationCap, CalendarClock, Target, Quote, ArrowRight } from 'lucide-react';

/**
 * "Our Constitution at a Glance" (About page).
 * Every fact here comes from the Constitution of the Ghana National Union of Technical
 * Students; article / schedule numbers are noted beside each list.
 */

// Article 13: Structure of GNUTS
const ORGANS = [
  'Congress',
  'Central Committee',
  'National Executive Committee',
  'Judicial Council',
  'Local SRCs of Member Institutions',
  'Advisory Board',
  'Alumni',
];

// Article 27: National Executive Committee
const NATIONAL_OFFICES = [
  'National President',
  'National Secretary',
  'Coordinating Secretary',
  'Research and Education Officer',
  'National Treasurer',
  'Public Relations Officer',
  "National Women's Commissioner",
];

// Fourth Schedule (membership) in the Fifth Schedule order, which is also the order
// in which the Annual Congress rotates among member institutions
const MEMBER_UNIVERSITIES = [
  'Accra Technical University',
  'Tamale Technical University',
  'Kumasi Technical University',
  'Cape Coast Technical University',
  'Sunyani Technical University',
  'Koforidua Technical University',
  'Bolgatanga Technical University',
  'Wa Technical University',
  'Takoradi Technical University',
  'Ho Technical University',
];

// Article 11: Aims and Objectives
const AIMS = [
  'Offer a common forum to discuss the challenges facing Technical and Vocational students and build solidarity among students.',
  'Foster unity and solidarity among Technical and Vocational students and stakeholders.',
  'Seek, defend and protect the rights of Technical and Vocational students, and influence decisions and policy to their benefit.',
  'Uphold the rule of law in Ghana to secure peace, democracy and socio-economic development.',
];

function Card({ icon, title, note, children }: { icon: React.ReactNode; title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/90 shadow-md p-6 sm:p-7 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-[#014900]/10 text-[#014900] flex items-center justify-center shrink-0">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-[#014900] leading-tight">{title}</h3>
          <p className="text-xs font-semibold text-gray-500">{note}</p>
        </div>
      </div>
      <div className="text-sm text-gray-700 leading-relaxed flex-1">{children}</div>
    </div>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-1.5">
      {items.map((item, i) => (
        <li key={item} className="flex gap-2.5">
          <span className="w-5 h-5 rounded-full bg-[#D9A000]/20 text-[#014900] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

export default function ConstitutionGlance() {
  return (
    <section id="constitution" className="py-20 sm:py-28 bg-[#FAF9F6] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#16201A]">
            Our Constitution at a Glance
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-5 leading-relaxed">
            The Constitution is the supreme law of GNUTS. It sets out who we are, how the Union is organised and how its
            leaders are chosen and held accountable.
          </p>
        </div>

        {/* Motto (Articles 4 and 9) */}
        <div className="bg-[#014900] text-white rounded-lg sm:rounded-xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 shadow-md">
          <Quote className="w-10 h-10 text-[#D9A000] shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-[#D9A000]">Slogan &amp; Motto</p>
            <p className="font-display text-xl sm:text-2xl font-semibold">GNUTS: Professionals with Integrity</p>
            <p className="text-sm text-gray-100 mt-1">
              Headquartered in Ghana&rsquo;s capital, GNUTS is autonomous and not subject to any other student union in Ghana.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card icon={<Landmark className="w-5 h-5" />} title="How GNUTS Is Organised" note="Article 13: the seven organs">
            <NumberedList items={ORGANS} />
          </Card>

          <Card icon={<Users className="w-5 h-5" />} title="National Executive Committee" note="Article 27: elected at Congress">
            <NumberedList items={NATIONAL_OFFICES} />
            <p className="mt-3 text-gray-600">Officers serve for one academic year.</p>
          </Card>

          <Card icon={<CalendarClock className="w-5 h-5" />} title="Congress" note="Articles 14 & 17">
            <p>
              The <strong>Annual Residential Congress</strong> is the Union&rsquo;s supreme legislative body. It amends the
              Constitution, sets policy, elects the National Secretariat and reviews the work of the National Executive
              Committee.
            </p>
            <p className="mt-3">
              Each member institution sends fifteen delegates, and Congress is hosted by the member universities in turn.
            </p>
          </Card>

          <Card icon={<GraduationCap className="w-5 h-5" />} title="Member Institutions" note="Fourth & Fifth Schedules">
            <p className="mb-3">
              All Technical Universities in Ghana are members. Listed in the order in which they host Congress:
            </p>
            <NumberedList items={MEMBER_UNIVERSITIES} />
            <p className="mt-3 text-gray-600">
              Other accredited Technical and Vocational institutions may apply to join, subject to the approval of Congress.
            </p>
          </Card>

          <Card icon={<Target className="w-5 h-5" />} title="Aims and Objectives" note="Article 11">
            <NumberedList items={AIMS} />
          </Card>

          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/90 shadow-md p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#014900] leading-tight">From GNUPS to GNUTS</h3>
              <p className="text-sm text-gray-700 leading-relaxed mt-3">
                The Constitution&rsquo;s conversion clause records that the name GNUTS replaced GNUPS when Ghana&rsquo;s
                polytechnics became technical universities by Act of Parliament. All rights of GNUPS passed to GNUTS, and
                polytechnics not yet converted remain full members.
              </p>
            </div>
            <Link
              href="/resources"
              className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] text-sm font-semibold rounded-lg transition-all"
            >
              Read the full Constitution <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
