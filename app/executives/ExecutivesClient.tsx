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
}

export default function ExecutivesClient({ initialExecutives }: ExecutivesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExecutives = initialExecutives.filter((officer) =>
    officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.institution.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen font-sans pb-24 text-gray-900">
      
      {/* HERO BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-12 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#014900] via-[#013500] to-[#012000] rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl border border-emerald-800/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D9A000]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-black uppercase tracking-widest text-[#D9A000]">
              <Users className="w-4 h-4" />
              <span>National Executive Committee (NEC)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-['Montserrat'] font-black uppercase tracking-tight leading-tight text-white">
              National <span className="text-[#D9A000]">Executive</span> Officers
            </h1>

            <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed pt-1">
              Meet the visionary student leaders championing technical university education, TVET industrial advocacy, and student welfare across Ghana.
            </p>
          </div>
        </div>
      </section>

      {/* SEARCH BAR */}
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
            National Leadership: <span className="text-[#014900] font-black">{filteredExecutives.length} Officers</span>
          </p>
        </div>
      </section>

      {/* OFFICERS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredExecutives.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-500 font-medium text-sm">
              {searchQuery ? `No officers found matching "${searchQuery}". Try clearing your search term.` : 'National Executive Committee directory is currently being updated. Check back soon.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredExecutives.map((officer) => (
            <div
              key={officer.id}
              className="bg-white rounded-3xl border border-gray-200/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
            >
              <div>
                {/* Officer Portrait - Compact, refined height with object-top */}
                <div className="relative h-52 sm:h-56 overflow-hidden bg-gray-100">
                  <img
                    src={officer.image_url}
                    alt={officer.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  <span className="absolute top-3.5 left-3.5 px-2.5 py-0.5 bg-[#014900] text-white font-black text-[9px] uppercase tracking-wider rounded-full shadow-md border border-white/20">
                    {officer.tenure || '2025/2026 Admin'}
                  </span>

                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                    <span className="text-[9px] font-black text-[#D9A000] uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded-full border border-white/10">
                      {officer.position}
                    </span>
                    <h3 className="font-['Montserrat'] font-black text-base sm:text-lg text-white mt-1 leading-snug">
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
                  <span className="text-gray-400 text-[11px]">Secretariat Secretariat</span>
                )}

                <span className="p-2 bg-gray-50 text-[#014900] rounded-xl font-bold text-[10px] uppercase tracking-wider">
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
