import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SERVICES = [
  { label: 'Scholarships and bursaries', href: '/scholarships' },
  { label: 'Internships and attachments', href: '/opportunities' },
  { label: 'Showcase your project', href: '/innovations' },
  { label: 'Constitution and documents', href: '/resources' },
];

export default function UnionCtaBanner() {
  return (
    <section className="bg-[#014900] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-6">
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#D9A000]">For students</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white leading-tight">
              Studying at a technical university or TVET institution?
            </h2>
            <p className="mt-4 text-base text-white/80 leading-relaxed max-w-xl">
              GNUTS represents you nationally. Use the union to find funding, get your work seen and know your rights
              as a student.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#D9A000] px-5 py-3 text-sm font-semibold text-[#013300] hover:bg-white transition-colors"
            >
              Contact the secretariat
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <ul className="lg:col-span-6 divide-y divide-white/15 border-y border-white/15">
            {SERVICES.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between gap-4 py-4 text-base font-medium text-white hover:text-[#D9A000] transition-colors"
                >
                  <span>{item.label}</span>
                  <ArrowRight
                    className="w-4 h-4 shrink-0 text-white/50 group-hover:text-[#D9A000] group-hover:translate-x-0.5 transition"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
