'use me';
'use client';

import Link from 'next/link';
import { ShieldCheck, Cpu, Award, ArrowRight, Sparkles, Building2, CheckCircle2 } from 'lucide-react';

export default function UnionPillarsSection() {
  const pillars = [
    {
      title: 'Technical Student Rights & Advocacy',
      subtitle: 'National Representation & Policy Fairness',
      description: 'GNUTS actively represents over 150,000 technical university and TVET students in national educational policy, ensuring fair tuition, campus safety, and student welfare.',
      icon: ShieldCheck,
      badge: 'ADVOCACY',
      link: '/about#policy',
    },
    {
      title: 'TVET and industry',
      subtitle: 'Skill-Building & Industry Attachments',
      description: 'Connecting technical students directly with industry partners, engineering grants, internship placements, and research showcases across Ghana.',
      icon: Cpu,
      badge: 'INNOVATION',
      link: '/innovations',
    },
    {
      title: 'Leadership & Continental Networks',
      subtitle: 'Leadership training for student officers',
      description: 'Collaborating with AASU and national student unions to build ethical, skilled, and industry-ready technical graduates for Africa’s industrialization.',
      icon: Award,
      badge: 'LEADERSHIP',
      link: '/about#leadership',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#f4f6f8] border-b border-gray-200" id="union-pillars">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — Inspired by Unite the Union & AASU */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#014900]/10 text-[#014900] text-xs font-bold uppercase tracking-wider">
            <span>OUR CORE PILLARS OF ACTION</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#16201A]">
            Championing Technical Excellence
          </h2>

          <p className="text-gray-600 text-sm sm:text-base font-medium leading-relaxed">
            Derived from our union constitution and continental partnerships, GNUTS works tirelessly across three main pillars to empower technical students across Ghana.
          </p>
        </div>

        {/* 3 Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:border-[#D9A000]/60 transition-all duration-300 group"
              >
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="w-14 h-14 rounded-lg bg-[#014900] text-[#D9A000] flex items-center justify-center shadow-md group-hover:scale-[1.03] transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 rounded-md bg-[#D9A000] text-[#014900] text-xs font-bold">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug group-hover:text-[#014900] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-bold text-[#014900] tracking-wide mt-1">
                      {item.subtitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100">
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#014900] group-hover:text-gold-ink transition-colors"
                  >
                    <span>Explore Pillar</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
