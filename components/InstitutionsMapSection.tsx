'use client';

import { useState } from 'react';
import { MapPin, Building2, Users, ExternalLink, ChevronRight, GraduationCap } from 'lucide-react';

interface University {
  id: string;
  name: string;
  shortName: string;
  region: string;
  city: string;
  students: string;
  srcPresident: string;
  established: string;
  badgeColor: string;
  bgGradient: string;
}

const UNIVERSITIES: University[] = [
  {
    id: 'atu',
    name: 'Accra Technical University',
    shortName: 'ATU',
    region: 'Greater Accra Region',
    city: 'Accra',
    students: '18,500+ Students',
    srcPresident: 'H.E. Michael Annan',
    established: '1949',
    badgeColor: 'bg-emerald-600',
    bgGradient: 'from-emerald-900 to-green-950',
  },
  {
    id: 'kstu',
    name: 'Kumasi Technical University',
    shortName: 'KsTU',
    region: 'Ashanti Region',
    city: 'Kumasi',
    students: '16,200+ Students',
    srcPresident: 'H.E. Emmanuel Frempong',
    established: '1954',
    badgeColor: 'bg-amber-600',
    bgGradient: 'from-amber-900 to-yellow-950',
  },
  {
    id: 'ttu',
    name: 'Takoradi Technical University',
    shortName: 'TTU',
    region: 'Western Region',
    city: 'Takoradi',
    students: '14,800+ Students',
    srcPresident: 'H.E. Priscilla Mensah',
    established: '1954',
    badgeColor: 'bg-blue-600',
    bgGradient: 'from-blue-900 to-slate-950',
  },
  {
    id: 'ktu',
    name: 'Koforidua Technical University',
    shortName: 'KTU',
    region: 'Eastern Region',
    city: 'Koforidua',
    students: '11,400+ Students',
    srcPresident: 'H.E. David Osei',
    established: '1997',
    badgeColor: 'bg-red-600',
    bgGradient: 'from-rose-900 to-red-950',
  },
  {
    id: 'htu',
    name: 'Ho Technical University',
    shortName: 'HTU',
    region: 'Volta Region',
    city: 'Ho',
    students: '9,800+ Students',
    srcPresident: 'H.E. Confidence Agbedanu',
    established: '1968',
    badgeColor: 'bg-teal-600',
    bgGradient: 'from-teal-900 to-cyan-950',
  },
  {
    id: 'stu',
    name: 'Sunyani Technical University',
    shortName: 'STU',
    region: 'Bono Region',
    city: 'Sunyani',
    students: '8,900+ Students',
    srcPresident: 'H.E. Kelvin Twumasi',
    established: '1967',
    badgeColor: 'bg-indigo-600',
    bgGradient: 'from-indigo-900 to-slate-950',
  },
  {
    id: 'tatu',
    name: 'Tamale Technical University',
    shortName: 'TaTU',
    region: 'Northern Region',
    city: 'Tamale',
    students: '10,500+ Students',
    srcPresident: 'H.E. Abdul-Rahman Yakubu',
    established: '1984',
    badgeColor: 'bg-yellow-600',
    bgGradient: 'from-amber-800 to-yellow-950',
  },
  {
    id: 'cctu',
    name: 'Cape Coast Technical University',
    shortName: 'CCTU',
    region: 'Central Region',
    city: 'Cape Coast',
    students: '7,600+ Students',
    srcPresident: 'H.E. Rita Asare',
    established: '1984',
    badgeColor: 'bg-purple-600',
    bgGradient: 'from-purple-900 to-indigo-950',
  },
];

export default function InstitutionsMapSection() {
  const [selectedUni, setSelectedUni] = useState<University>(UNIVERSITIES[0]);

  return (
    <section className="py-20 sm:py-28 bg-[#0b140c] text-white relative overflow-hidden border-b border-white/10" id="institutions-section">
      {/* Decorative Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#014900]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D9A000]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="px-3.5 py-1 text-xs font-extrabold rounded-md uppercase tracking-wider bg-[#D9A000] text-[#014900] inline-block mb-3 shadow-sm">
              NATIONWIDE FOOTPRINT
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
              Member Technical Universities
            </h2>
            <div className="w-16 h-1.5 bg-[#D9A000] rounded-full my-3" />
            <p className="text-gray-300 text-sm sm:text-base max-w-2xl font-medium">
              GNUTS represents over 100,000+ technical and vocational students across all 10 public Technical Universities in Ghana.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-bold text-gray-400">10 Institutions</span>
            <span className="w-2 h-2 rounded-full bg-[#D9A000]" />
            <span className="text-xs sm:text-sm font-bold text-[#D9A000]">100% Accredited</span>
          </div>
        </div>

        {/* Main Grid: Interactive Selector + Detailed Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Campus List Selector (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {UNIVERSITIES.map((uni) => {
              const isSelected = selectedUni.id === uni.id;
              return (
                <button
                  key={uni.id}
                  onClick={() => setSelectedUni(uni)}
                  className={`text-left p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-white/10 border-[#D9A000] shadow-xl ring-2 ring-[#D9A000]/40 -translate-y-1'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 w-full mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${uni.badgeColor} text-white flex items-center justify-center font-black text-sm shadow-md shrink-0`}>
                        {uni.shortName}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-white leading-snug group-hover:text-[#D9A000] transition-colors">
                          {uni.name}
                        </h4>
                        <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 font-medium">
                          <MapPin className="w-3 h-3 text-[#D9A000]" />
                          {uni.city}, {uni.region}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-gray-300 font-medium">
                    <span>{uni.students}</span>
                    <span className={`font-bold transition-colors ${isSelected ? 'text-[#D9A000]' : 'text-gray-400 group-hover:text-white'}`}>
                      {isSelected ? 'Active Selection ✓' : 'View Campus →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Featured Selected Campus Card (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#014900] to-[#002b00] p-8 rounded-2xl border border-white/15 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#D9A000]/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/15">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#D9A000] text-[#014900]">
                  {selectedUni.shortName} SECRETARIAT
                </span>
                <span className="text-xs text-gray-300 font-medium">Est. {selectedUni.established}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
                {selectedUni.name}
              </h3>
              <p className="text-sm text-gray-300 flex items-center gap-1.5 mb-6 font-medium">
                <MapPin className="w-4 h-4 text-[#D9A000]" />
                {selectedUni.region}
              </p>

              <div className="space-y-4 mb-8">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#D9A000] text-[#014900] flex items-center justify-center font-bold shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">Student Body</span>
                    <span className="text-base font-extrabold text-white">{selectedUni.students}</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white text-[#014900] flex items-center justify-center font-bold shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">SRC President</span>
                    <span className="text-base font-extrabold text-white">{selectedUni.srcPresident}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/15">
              <a
                href="/about#leadership"
                className="w-full py-3.5 px-6 bg-[#D9A000] text-[#014900] font-extrabold text-sm rounded-xl hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>View Campus Representatives</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
