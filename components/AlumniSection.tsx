import Link from 'next/link';
import { Quote, Award, CheckCircle2, ArrowUpRight, Building } from 'lucide-react';

interface Alumnus {
  id: number;
  name: string;
  role: string;
  company: string;
  institution: string;
  gradYear: string;
  quote: string;
  image: string;
  achievement: string;
  badge: string;
}

const ALUMNI: Alumnus[] = [
  {
    id: 1,
    name: 'Ing. Dr. Kwame Mensah',
    role: 'Founder & Managing Director',
    company: 'Apex Renewable Power Solutions',
    institution: 'Kumasi Technical University (KsTU)',
    gradYear: 'Class of 2012',
    quote: 'TVET provided me with the practical engineering foundation to build Ghana’s leading solar infrastructure startup. Practical skills are the bedrock of economic independence.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    achievement: 'Pioneered 45MW Commercial Solar Projects across West Africa',
    badge: 'ENGINEERING INNOVATOR',
  },
  {
    id: 2,
    name: 'Abena Osei-Wusu',
    role: 'Lead Systems Architect & Robotics Engineer',
    company: 'AfriTech Systems Ltd',
    institution: 'Accra Technical University (ATU)',
    gradYear: 'Class of 2017',
    quote: 'Hands-on technical education prepared me to build industrial automation tools that compete on global stages. GNUTS advocacy champions the next generation of builders.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    achievement: 'Winner, 2024 Pan-African Industrial Automation Award',
    badge: 'ROBOTICS & TECH LEAD',
  },
  {
    id: 3,
    name: 'Eng. Emmanuel Addo',
    role: 'Director of Infrastructure Development',
    company: 'Ghana Ports & Harbours Authority',
    institution: 'Takoradi Technical University (TTU)',
    gradYear: 'Class of 2014',
    quote: 'GNUTS leadership taught me public policy advocacy, while technical university training gave me execution power to direct multi-million dollar maritime engineering projects.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    achievement: 'Overseeing Ghana Maritime Infrastructure Expansion',
    badge: 'PUBLIC INFRASTRUCTURE LEAD',
  },
];

export default function AlumniSection() {
  return (
    <section className="py-20 sm:py-28 bg-[#f8f9fa] border-b border-gray-200" id="alumni-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="px-3.5 py-1 text-xs font-extrabold rounded-md uppercase tracking-wider bg-[#014900] text-white inline-block mb-3 shadow-sm">
              TVET EXCELLENCE
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#014900] tracking-tight uppercase">
              Alumni Success Stories
            </h2>
            <div className="w-16 h-1.5 bg-[#D9A000] rounded-full my-3" />
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl font-medium">
              From technical university lecture halls to directing multinational corporations and founding industry-defining enterprises across Africa.
            </p>
          </div>
          <Link
            href="/about#alumni"
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#014900] hover:text-[#D9A000] transition-colors"
          >
            Explore Alumni Network →
          </Link>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 reveal-on-scroll">
          {/* Featured Alumni (7 Cols) */}
          {ALUMNI[0] && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-12 h-full">
                {/* Image Section */}
                <div className="md:col-span-5 relative h-72 md:h-full bg-gray-900 overflow-hidden shrink-0">
                  <img
                    src={ALUMNI[0].image}
                    alt={ALUMNI[0].name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider bg-[#D9A000] text-white shadow-sm">
                      {ALUMNI[0].badge}
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#D9A000]" />
                </div>

                {/* Content Section */}
                <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <Quote className="w-10 h-10 text-[#014900]/20 mb-4" />
                    <p className="text-gray-800 text-base sm:text-lg leading-relaxed font-semibold italic mb-6">
                      "{ALUMNI[0].quote}"
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xl font-extrabold text-[#014900] leading-snug">
                      {ALUMNI[0].name}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">
                      {ALUMNI[0].role} — <span className="text-[#D9A000]">{ALUMNI[0].company}</span>
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-[#014900]" />
                      {ALUMNI[0].institution} ({ALUMNI[0].gradYear})
                    </p>

                    <div className="mt-4 p-3 rounded-lg bg-[#f8f9fa] border border-gray-200/80 flex items-center gap-2 text-xs font-bold text-[#014900]">
                      <CheckCircle2 className="w-4 h-4 text-[#D9A000] shrink-0" />
                      <span>{ALUMNI[0].achievement}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Alumni Stack (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {ALUMNI.slice(1).map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row gap-5 group"
              >
                <div className="w-full sm:w-32 h-36 rounded-xl overflow-hidden bg-gray-900 shrink-0 relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider bg-[#014900] text-white">
                      ALUMNI
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-between flex-grow">
                  <div>
                    <p className="text-xs text-gray-700 italic line-clamp-3 font-medium mb-3">
                      "{item.quote}"
                    </p>
                    <h4 className="font-extrabold text-base text-[#014900] group-hover:text-[#D9A000] transition-colors leading-snug">
                      {item.name}
                    </h4>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">
                      {item.role}
                    </p>
                    <p className="text-[11px] text-[#D9A000] font-semibold">
                      {item.company}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>{item.institution.split('(')[1]?.replace(')', '') || item.institution}</span>
                    <span className="font-bold text-[#014900]">{item.gradYear}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
