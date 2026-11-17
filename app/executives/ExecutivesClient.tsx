'use client';

import { useState } from 'react';
import { ExecutiveOfficer } from './page';
import { 
  Users, 
  Building2, 
  Mail, 
  Phone, 
  Search, 
  Sparkles, 
  Award, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface ExecutivesClientProps {
  initialExecutives: ExecutiveOfficer[];
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
}

export default function ExecutivesClient({ 
  initialExecutives,
  heroImage = '/images/header_for_pages.jpg',
  heroTitle = 'National Executive Officers',
  heroSubtitle = 'Meet the visionary student leaders championing technical university education, TVET industrial advocacy, and student welfare across Ghana.'
}: ExecutivesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExecutives = initialExecutives.filter((officer) =>
    officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.institution.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const safeBgUrl = encodeURI(heroImage);

  return (
    <div className="bg-white min-h-screen pb-24 text-gray-900">
      
      {/* HERO BANNER - 50% opacity green overlay & border-b-4 border-[#D9A000] */}
      <section className="relative text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-[#D9A000] overflow-hidden bg-gray-900 mb-8">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${safeBgUrl}')` }}
        />
        {/* Semi-transparent Green Overlay (55% Green Opacity) */}
        <div className="absolute inset-0 bg-[#014900]/55 backdrop-brightness-90" />

        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-extrabold uppercase tracking-widest text-[#D9A000]">
            <Users className="w-4 h-4" />
            <span>National Executive Committee (NEC)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight leading-tight text-white drop-shadow-md">
            {heroTitle}
          </h1>

          <p className="text-gray-100 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-medium drop-shadow-sm leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* SEARCH BAR (Only show when officers exist) */}
      {initialExecutives.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-gray-50 p-4 rounded-3xl border border-gray-200/80 flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by officer name, role, or university..."
                className="w-full pl-11 pr-4 py-2.5 bg-white rounded-2xl border border-gray-200 text-xs font-medium text-gray-900 outline-none focus:border-[#014900]"
              />
            </div>
            <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider hidden sm:block">
              National Leadership: <span className="text-[#014900] font-extrabold">{filteredExecutives.length} {filteredExecutives.length === 1 ? 'Officer' : 'Officers'}</span>
            </p>
          </div>
        </section>
      )}

      {/* OFFICERS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredExecutives.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Users className="w-8 h-8 text-[#014900]" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 uppercase">
              {searchQuery ? 'No Officers Found' : 'Directory Updating'}
            </h3>
            <p className="text-gray-500 font-medium text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
              {searchQuery 
                ? `No officers found matching "${searchQuery}". Please try clearing your search.` 
                : 'The National Executive Committee leadership roster for the current administration is currently being updated by the Secretariat. Check back soon.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredExecutives.map((officer) => (
            <div
              key={officer.id}
              className="bg-white rounded-3xl border border-gray-200/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group max-w-[290px] mx-auto md:max-w-none w-full"
            >
              <div>
                {/* Officer Portrait - Compact, refined height with object-top */}
                <div className="relative h-52 sm:h-56 overflow-hidden bg-gray-100">
                  <img
                    src={officer.image_url}
                    alt={`${officer.name}, ${officer.position}, GNUTS`}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  <span className="absolute top-3.5 left-3.5 px-2.5 py-0.5 bg-[#014900] text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-md border border-white/20">
                    {officer.tenure || '2025/2026 Admin'}
                  </span>

                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                    <span className="text-xs font-extrabold text-[#D9A000] uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded-full border border-white/10">
                      {officer.position}
                    </span>
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-white mt-1 leading-snug">
                      {officer.name}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#014900] bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-200">
                    <Building2 className="w-4 h-4 text-[#D9A000] shrink-0" />
                    <span>{officer.institution}</span>
                  </div>

                  <p className="text-xs text-gray-600 font-normal leading-relaxed line-clamp-3">
                    {officer.bio}
                  </p>
                </div>
              </div>

              {/* Contact Footer */}
              <div className="p-6 pt-0 border-t border-gray-100 mt-4 flex items-center justify-between text-xs">
                {officer.email ? (
                  <a
                    href={`mailto:${officer.email}`}
                    className="inline-flex items-center gap-1.5 text-gray-600 hover:text-[#014900] font-bold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#014900]" />
                    <span>{officer.email}</span>
                  </a>
                ) : (
                  <span className="text-gray-400 text-xs">Secretariat Secretariat</span>
                )}

                <span className="p-2 bg-gray-50 text-[#014900] rounded-xl font-bold text-xs uppercase tracking-wider">
                  Verified Executive
                </span>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

    </div>
  );
}
