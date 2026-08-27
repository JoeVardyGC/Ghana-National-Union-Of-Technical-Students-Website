'use client';

import { useState, useEffect, useMemo } from 'react';
import { Scholarship, Opportunity } from '@/app/scholarships/page';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Search, 
  Filter, 
  Sparkles, 
  CheckSquare, 
  Square, 
  Bell, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Building2,
  GraduationCap,
  Briefcase,
  ChevronDown
} from 'lucide-react';

interface ScholarshipsClientProps {
  activeScholarships: Scholarship[];
  closedScholarships: Scholarship[];
  activeOpportunities: Opportunity[];
  closedOpportunities: Opportunity[];
}

export default function ScholarshipsClient({
  activeScholarships,
  closedScholarships,
  activeOpportunities,
  closedOpportunities,
}: ScholarshipsClientProps) {
  // 1. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'SCHOLARSHIPS' | 'INTERNSHIPS' | 'SKILL_CAMPS'>('ALL');

  // 3. Document Checklist State
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  // 4. Alert Signup & Auto-Popup Modal State
  const [popupModalOpen, setPopupModalOpen] = useState(false);
  const [alertPhoneOrEmail, setAlertPhoneOrEmail] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  // 5. Requirements Dropdown Accordion State
  const [expandedRequirements, setExpandedRequirements] = useState<Record<number, boolean>>({});

  const toggleRequirements = (id: number) => {
    setExpandedRequirements(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Trigger popup when student comes to the page
  useEffect(() => {
    const timer = setTimeout(() => {
      setPopupModalOpen(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Toggle checklist item
  const toggleDoc = (key: string) => {
    setCheckedDocs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Urgency & Days Left Calculator
  const getUrgencyInfo = (deadlineStr?: string) => {
    if (!deadlineStr || deadlineStr === 'Ongoing' || deadlineStr === 'Open' || deadlineStr === 'Academic Entry') {
      return null;
    }
    try {
      const deadlineDate = new Date(deadlineStr);
      if (isNaN(deadlineDate.getTime())) return null;
      
      const today = new Date();
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0 && diffDays <= 45) {
        return {
          text: `CLOSING IN ${diffDays} DAYS`,
          daysLeft: diffDays,
          isUrgent: diffDays <= 20,
        };
      }
    } catch {}
    return null;
  };

  // Filtered Scholarships
  const filteredScholarships = useMemo(() => {
    return activeScholarships.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.requirements && item.requirements.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'ALL' || selectedCategory === 'SCHOLARSHIPS';
      return matchesSearch && matchesCat;
    });
  }, [activeScholarships, searchQuery, selectedCategory]);

  // Filtered Opportunities
  const filteredOpportunities = useMemo(() => {
    return activeOpportunities.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesCat = true;
      if (selectedCategory === 'SCHOLARSHIPS') matchesCat = false;
      if (selectedCategory === 'INTERNSHIPS') matchesCat = item.type === 'INTERNSHIP';
      if (selectedCategory === 'SKILL_CAMPS') matchesCat = item.type === 'SKILL_CAMP';

      return matchesSearch && matchesCat;
    });
  }, [activeOpportunities, searchQuery, selectedCategory]);

  // Alert Handler
  const handleAlertSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertPhoneOrEmail.trim()) {
      setAlertSuccess(true);
      setTimeout(() => setAlertSuccess(false), 5000);
      setAlertPhoneOrEmail('');
    }
  };

  return (
    <div className="py-10 sm:py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* 2. LIVE SEARCH & MULTI-TAG FILTER BAR */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/90 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search GETFund, SLTF, STEM, Accra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#014900] focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto touch-pan-x sm:flex-wrap w-full md:w-auto pb-1 sm:pb-0 no-scrollbar scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all border ${
                selectedCategory === 'ALL'
                  ? 'bg-[#014900] text-white border-[#014900] shadow-sm'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              All Listings
            </button>
            <button
              onClick={() => setSelectedCategory('SCHOLARSHIPS')}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all border ${
                selectedCategory === 'SCHOLARSHIPS'
                  ? 'bg-[#014900] text-white border-[#014900] shadow-sm'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              Scholarships
            </button>
            <button
              onClick={() => setSelectedCategory('INTERNSHIPS')}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all border ${
                selectedCategory === 'INTERNSHIPS'
                  ? 'bg-[#014900] text-white border-[#014900] shadow-sm'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              Internships
            </button>
            <button
              onClick={() => setSelectedCategory('SKILL_CAMPS')}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all border ${
                selectedCategory === 'SKILL_CAMPS'
                  ? 'bg-[#014900] text-white border-[#014900] shadow-sm'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              Skill Camps
            </button>
          </div>
        </div>
      </section>

      {/* 3. AVAILABLE SCHOLARSHIPS SECTION */}
      {(selectedCategory === 'ALL' || selectedCategory === 'SCHOLARSHIPS') && (
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#014900] tracking-tight relative inline-block pb-3">
              Available Scholarships
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#D9A000]" />
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-3">
              Explore financial aid opportunities currently accepting applications
            </p>
          </div>

          {filteredScholarships.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
              <div className="text-4xl mb-3">🎓</div>
              <p className="text-gray-500 font-medium text-sm">
                {searchQuery ? `No matching scholarships found for "${searchQuery}". Try clearing your search term.` : 'No active scholarships currently available. Check back soon for new bursary announcements.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredScholarships.map((item) => {
                const urgency = getUrgencyInfo(item.deadline);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 shadow-md border border-gray-200 flex flex-col justify-between transition-all duration-300 hover-green-glow group"
                  >
                    <div className="space-y-4">
                      {/* Badge Header: Active Badge + Urgency Pill */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-block px-3 py-1 bg-[#014900] text-white text-[11px] font-bold uppercase tracking-wider rounded-full">
                          Active
                        </span>

                        {urgency && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full text-white ${
                            urgency.isUrgent ? 'bg-[#D9A000] animate-pulse' : 'bg-amber-600'
                          }`}>
                            <AlertCircle className="w-3 h-3" />
                            <span>{urgency.text}</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-[#014900] transition-colors leading-snug">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>

                      {/* Collapsible Application Requirements Accordion */}
                      {item.requirements && (
                        <div className="my-3">
                          <button
                            type="button"
                            onClick={() => toggleRequirements(item.id)}
                            className="w-full flex items-center justify-between p-3 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/60 rounded-xl transition-colors text-left group/req"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#014900]" />
                              <span className="text-xs font-extrabold text-[#014900] uppercase tracking-wider">
                                {expandedRequirements[item.id] ? 'Hide Application Requirements' : 'View Application Requirements'}
                              </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-[#014900] transition-transform duration-300 ${
                              expandedRequirements[item.id] ? 'rotate-180' : ''
                            }`} />
                          </button>

                          {expandedRequirements[item.id] && (
                            <div className="mt-2 p-4 bg-amber-50/40 border border-amber-200/70 rounded-2xl space-y-3 animate-fadeIn">
                              {(() => {
                                const reqLines = item.requirements
                                  ? item.requirements.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
                                  : [];
                                const totalReqs = reqLines.length;
                                const completedCount = reqLines.filter((_, rIdx) => checkedDocs[`${item.id}-req-${rIdx}`]).length;

                                return (
                                  <>
                                    <div className="flex items-center justify-between gap-2 border-b border-amber-200/50 pb-2">
                                      <h4 className="text-xs font-extrabold text-[#014900] uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-[#D9A000]" />
                                        <span>Mandatory Application Documents</span>
                                      </h4>
                                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                        completedCount === totalReqs && totalReqs > 0
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-[#D9A000] text-white'
                                      }`}>
                                        {completedCount}/{totalReqs} READY
                                      </span>
                                    </div>

                                    <div className="space-y-1.5 pt-1">
                                      {reqLines.map((reqLine, rIdx) => {
                                        const docKey = `${item.id}-req-${rIdx}`;
                                        const isChecked = !!checkedDocs[docKey];

                                        return (
                                          <button
                                            type="button"
                                            key={rIdx}
                                            onClick={() => toggleDoc(docKey)}
                                            className={`w-full flex items-start gap-2.5 text-left text-xs sm:text-sm p-2.5 rounded-xl transition-all border ${
                                              isChecked
                                                ? 'bg-emerald-50/90 border-emerald-300 text-[#014900] shadow-sm'
                                                : 'bg-white/90 border-amber-200/60 text-gray-700 hover:border-amber-300 hover:bg-amber-50/30'
                                            }`}
                                          >
                                            {isChecked ? (
                                              <CheckSquare className="w-4 h-4 text-[#014900] shrink-0 mt-0.5" />
                                            ) : (
                                              <Square className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                            )}
                                            <span className={isChecked ? 'line-through text-gray-500 font-medium leading-relaxed' : 'font-medium leading-relaxed'}>
                                              {reqLine.replace(/^•\s*/, '')}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Meta Details: Deadline & Posted Date */}
                      <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                        {item.deadline && (
                          <span className="flex items-center gap-1.5 text-gray-700 font-semibold">
                            <Calendar className="w-4 h-4 text-[#D9A000] shrink-0" />
                            Deadline: {item.deadline}
                          </span>
                        )}
                        {item.createdAt && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                            Posted: {item.createdAt}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Apply Button */}
                    {item.link && (
                      <div className="mt-6 pt-4">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#014900] hover:bg-[#013300] text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl transition-all duration-300 shadow-sm hover:shadow"
                        >
                          <span>Apply Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 4. POPUP MODAL FOR DIRECT STUDENT BROADCAST ALERTS (Matches user screenshot 1-to-1) */}
      {popupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
          {/* Modal Background Dismiss Overlay */}
          <div 
            className="fixed inset-0" 
            onClick={() => setPopupModalOpen(false)}
          />

          {/* Modal Content Window */}
          <div className="bg-white border-2 border-[#014900] p-6 sm:p-10 rounded-3xl shadow-2xl relative max-w-4xl w-full z-10 animate-fadeInUp">
            {/* Close Button (✕) */}
            <button
              onClick={() => setPopupModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 font-extrabold text-2xl p-1 transition-colors leading-none"
              aria-label="Close Popup"
            >
              ✕
            </button>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center lg:text-left max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#014900] uppercase tracking-wider">
                  <Bell className="w-4 h-4 text-[#D9A000]" />
                  <span>DIRECT STUDENT BROADCAST ALERTS</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Never Miss a Scholarship Deadline
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                  Join over 40,000+ technical students receiving instant alerts on WhatsApp and Email whenever new GETFund, SLTF, or international grants open up.
                </p>
              </div>

              <form onSubmit={handleAlertSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  placeholder="Enter Phone Number or Email..."
                  value={alertPhoneOrEmail}
                  onChange={(e) => setAlertPhoneOrEmail(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#014900] focus:bg-white w-full sm:w-72 font-medium"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#014900] hover:bg-[#013300] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shrink-0"
                >
                  GET FREE ALERTS
                </button>
              </form>
            </div>

            {alertSuccess && (
              <div className="mt-5 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Success! You have been subscribed to GNUTS Scholarship Broadcast Alerts.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. AVAILABLE OPPORTUNITIES SECTION (INTERNSHIPS & SKILL CAMPS) */}
      {(selectedCategory === 'ALL' || selectedCategory === 'INTERNSHIPS' || selectedCategory === 'SKILL_CAMPS') && (
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#014900] tracking-tight relative inline-block pb-3">
              Available Opportunities
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#D9A000]" />
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-3">
              Explore internships, skill development programs, and grants currently accepting applications
            </p>
          </div>

          {filteredOpportunities.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
              <div className="text-4xl mb-3">💼</div>
              <p className="text-gray-500 font-medium text-sm">
                No matching opportunities found for "{searchQuery}".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredOpportunities.map((item, idx) => {
                const typeDisplay = item.type.replace('_', ' ').toUpperCase();
                const urgency = getUrgencyInfo(item.deadline);
                const isGold = idx % 2 === 1;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 shadow-md border border-gray-200 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group"
                  >
                    <div className="space-y-4">
                      {/* Header Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`px-3 py-1 text-white text-[11px] font-bold uppercase tracking-wider rounded-full ${
                          isGold ? 'bg-[#D9A000]' : 'bg-[#014900]'
                        }`}>
                          {typeDisplay}
                        </span>
                        
                        {urgency ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full text-white ${
                            urgency.isUrgent ? 'bg-[#D9A000] animate-pulse' : 'bg-amber-600'
                          }`}>
                            <AlertCircle className="w-3 h-3" />
                            <span>{urgency.text}</span>
                          </span>
                        ) : (
                          <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${
                            isGold 
                              ? 'bg-amber-50 text-[#D9A000] border-amber-200' 
                              : 'bg-emerald-50 text-[#014900] border-emerald-200'
                          }`}>
                            Active
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className={`text-xl font-extrabold text-gray-900 transition-colors leading-snug ${
                        isGold ? 'group-hover:text-[#D9A000]' : 'group-hover:text-[#014900]'
                      }`}>
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Meta Details: Location, Deadline, Posted */}
                      <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500 font-medium">
                        {item.location && (
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <MapPin className={`w-4 h-4 shrink-0 ${isGold ? 'text-[#014900]' : 'text-[#D9A000]'}`} />
                            <span>{item.location}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-4">
                          {item.deadline && (
                            <span className="flex items-center gap-1.5 text-gray-700 font-semibold">
                              <Calendar className={`w-4 h-4 shrink-0 ${isGold ? 'text-[#014900]' : 'text-[#D9A000]'}`} />
                              Deadline: {item.deadline}
                            </span>
                          )}
                          {item.createdAt && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                              Posted: {item.createdAt}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Apply Button */}
                    {item.link && (
                      <div className="mt-6 pt-4">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center gap-2 w-full px-6 py-3 text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl transition-all duration-300 shadow-sm hover:shadow ${
                            isGold ? 'bg-[#D9A000] hover:bg-yellow-600' : 'bg-[#014900] hover:bg-[#013300]'
                          }`}
                        >
                          <span>Apply Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 6. RECENTLY CLOSED SCHOLARSHIPS SECTION */}
      {closedScholarships.length > 0 && (
        <section className="bg-gray-100 py-12 border-t border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight relative inline-block pb-3">
                Recently Closed Scholarships
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-400" />
              </h2>
              <p className="text-gray-500 text-sm sm:text-base mt-2">
                These opportunities are no longer accepting applications
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedScholarships.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-full">
                      Closed
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Closed: {item.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. RECENTLY CLOSED OPPORTUNITIES SECTION */}
      {closedOpportunities.length > 0 && (
        <section className="bg-gray-100 py-12 border-t border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight relative inline-block pb-3">
                Recently Closed Opportunities
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-400" />
              </h2>
              <p className="text-gray-500 text-sm sm:text-base mt-2">
                These programs are no longer accepting applications
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedOpportunities.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider rounded-full">
                      {item.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-full">
                      Closed
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Closed: {item.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
