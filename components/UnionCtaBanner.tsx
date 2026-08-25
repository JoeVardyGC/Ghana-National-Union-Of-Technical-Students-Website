'use me';
'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, GraduationCap, Lightbulb } from 'lucide-react';

export default function UnionCtaBanner() {
  return (
    <section className="relative py-20 bg-gradient-to-r from-[#002700] via-[#014900] to-[#002b00] text-white overflow-hidden border-t border-gray-200">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#D9A000_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#D9A000]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline & Value Props */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Are You a Technical Student in Ghana?
            </h2>

            <p className="text-gray-200 text-sm sm:text-lg leading-relaxed max-w-2xl font-normal">
              GNUTS is your national representative voice. Access active scholarships, submit your technical innovations, check CTVET results, and stay connected with student affairs across all technical universities.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-100">
                <CheckCircle2 className="w-4 h-4 text-[#D9A000] shrink-0" />
                <span>Scholarship Access</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-100">
                <CheckCircle2 className="w-4 h-4 text-[#D9A000] shrink-0" />
                <span>TVET Innovation Support</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-100">
                <CheckCircle2 className="w-4 h-4 text-[#D9A000] shrink-0" />
                <span>National Advocacy</span>
              </div>
            </div>
          </div>

          {/* Right Column: CTA Action Card */}
          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl space-y-5">
            <h3 className="text-xl font-extrabold text-white">Get Started Today</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Explore available tertiary funding or submit your engineering/tech project for national recognition.
            </p>

            <div className="space-y-3 pt-2">
              <Link
                href="/scholarships"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#D9A000] text-[#014900] font-extrabold text-sm hover:bg-white transition-colors shadow-md text-center"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Explore Scholarships</span>
              </Link>

              <Link
                href="/innovations"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-sm transition-colors text-center"
              >
                <Lightbulb className="w-4 h-4 text-[#D9A000]" />
                <span>Submit Innovation</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
