'use client';

import { useState } from 'react';
import { OpportunityItem } from './page';
import { 
  Briefcase, 
  Award, 
  Trophy, 
  GraduationCap, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Search, 
  Filter, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Sparkles,
  ArrowUpRight,
  Send,
  FileCheck
} from 'lucide-react';

interface OpportunitiesClientProps {
  initialOpportunities: OpportunityItem[];
}

export default function OpportunitiesClient({ initialOpportunities }: OpportunitiesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityItem | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  // Form State for Application
  const [applicantName, setApplicantName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [institution, setInstitution] = useState('Accra Technical University');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [statement, setStatement] = useState('');

  const categories = [
    { name: 'All', icon: Sparkles },
    { name: 'Industrial Attachment', icon: Briefcase },
    { name: 'TVET Grant', icon: Award },
    { name: 'Skill Competition', icon: Trophy },
    { name: 'Fellowship', icon: GraduationCap },
  ];

  const filteredOpportunities = initialOpportunities.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenApplyModal = (opportunity: OpportunityItem) => {
    setSelectedOpportunity(opportunity);
    setIsApplyModalOpen(true);
    setIsSuccessMessage(false);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccessMessage(true);
    setTimeout(() => {
      setIsApplyModalOpen(false);
      setIsSuccessMessage(false);
      setApplicantName('');
      setIndexNumber('');
      setEmail('');
      setPhone('');
      setStatement('');
    }, 2500);
  };

  return (
    <div className="bg-white min-h-screen font-sans pb-24 text-gray-900">
      
      {/* 1. HERO BANNER: Union Forest Green Curved Shell */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-12 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#014900] via-[#013500] to-[#012000] rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl border border-emerald-800/40">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D9A000]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-black uppercase tracking-widest text-[#D9A000]">
              <Sparkles className="w-4 h-4" />
              <span>National TVET Career & Growth Hub</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-['Montserrat'] font-black uppercase tracking-tight leading-tight text-white">
              Student <span className="text-[#D9A000]">Opportunities</span> & TVET Placements
            </h1>

            <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed pt-2">
              Empowering Ghanaian Technical University students with direct access to industrial attachments, TVET research grants, national skill championships, and leadership fellowships.
            </p>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-bold text-emerald-200">
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15">
                <Briefcase className="w-4 h-4 text-[#D9A000]" />
                <span>15+ Partner Industries</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15">
                <Award className="w-4 h-4 text-[#D9A000]" />
                <span>GH₵ 500K+ Seed Funding</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15">
                <GraduationCap className="w-4 h-4 text-[#D9A000]" />
                <span>10 Technical Universities Covered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTROLS BAR: Search & Category Filter Buttons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Search & Status Filter Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-200/80 shadow-xs">
          
          {/* Keyword Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, industry partner, or location..."
              className="w-full pl-11 pr-4 py-2.5 bg-white rounded-2xl border border-gray-200 text-xs font-medium text-gray-900 outline-none focus:border-[#014900] focus:ring-2 focus:ring-[#014900]/20 transition-all placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar scrollbar-none">
            <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider shrink-0 mr-1">Status:</span>
            {['All', 'open', 'closing_soon'].map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => setSelectedStatus(statusKey)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                  selectedStatus === statusKey
                    ? 'bg-[#014900] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-200/70 border border-gray-200'
                }`}
              >
                {statusKey === 'closing_soon' ? 'Closing Soon' : statusKey}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#014900] text-white shadow-lg scale-102 font-black'
                    : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200 border border-gray-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D9A000]' : 'text-gray-500'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. OPPORTUNITIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div className="flex items-center justify-between pb-6">
          <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            Showing <span className="text-[#014900] font-black">{filteredOpportunities.length}</span> Active Opportunities
          </p>
        </div>

        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
            <div className="text-4xl mb-3">💼</div>
            <p className="text-gray-500 font-medium text-sm">
              {searchQuery ? `No matching opportunities found for "${searchQuery}". Try clearing your search term.` : 'No active student opportunities or attachments available at the moment. Check back soon.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredOpportunities.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-200/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
              >
                <div>
                  {/* Card Header Stamp */}
                  <div className="p-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-3 bg-gradient-to-b from-gray-50/80 to-white">
                    
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#014900] flex items-center justify-center font-black shrink-0 shadow-2xs">
                        {item.category === 'Industrial Attachment' && <Briefcase className="w-5 h-5" />}
                        {item.category === 'TVET Grant' && <Award className="w-5 h-5 text-amber-600" />}
                        {item.category === 'Skill Competition' && <Trophy className="w-5 h-5 text-amber-500" />}
                        {item.category === 'Fellowship' && <GraduationCap className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#014900] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {item.category}
                        </span>
                        <p className="text-xs font-extrabold text-gray-900 mt-1 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>{item.partner}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {item.status === 'closing_soon' ? (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider rounded-full shrink-0 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>Closing Soon</span>
                      </span>
                    ) : item.status === 'open' ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-[#014900] border border-emerald-300 text-[10px] font-black uppercase tracking-wider rounded-full shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Open</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider rounded-full shrink-0">
                        Closed
                      </span>
                    )}

                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 space-y-4">
                    <h3 className="font-['Montserrat'] font-black text-lg text-gray-900 leading-snug group-hover:text-[#014900] transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-600 font-normal leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    {/* Key Details Pills */}
                    <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                      
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-[#014900] shrink-0" />
                        <span className="font-semibold text-gray-600">{item.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign className="w-3.5 h-3.5 text-[#D9A000] shrink-0" />
                        <span className="font-extrabold text-emerald-950">{item.stipend_reward}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="font-bold text-gray-700">Deadline: {item.deadline}</span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Card Action Footer Button */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleOpenApplyModal(item)}
                    className="w-full py-3 px-4 bg-[#014900] hover:bg-[#003800] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg transition-all cursor-pointer"
                  >
                    <span>View Details & Apply</span>
                    <ArrowUpRight className="w-4 h-4 text-[#D9A000] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </section>

      {/* 4. INTERACTIVE APPLICATION MODAL */}
      {isApplyModalOpen && selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#014900] to-[#013500] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A000] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                  {selectedOpportunity.category}
                </span>
                <h2 className="font-['Montserrat'] font-black text-lg sm:text-xl text-white mt-1">
                  {selectedOpportunity.title}
                </h2>
                <p className="text-xs text-emerald-200 font-bold">{selectedOpportunity.partner}</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {isSuccessMessage ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-[#014900] rounded-full mx-auto flex items-center justify-center">
                    <FileCheck className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase">Application Submitted!</h3>
                  <p className="text-xs text-gray-600 max-w-md mx-auto">
                    Your application for <span className="font-bold text-[#014900]">{selectedOpportunity.title}</span> has been received by the GNUTS Secretariat. Our opportunities directorate will review your details shortly.
                  </p>
                </div>
              ) : (
                <>
                  {/* Opportunity Details Summary */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                    <h4 className="font-extrabold uppercase tracking-wider text-[#014900] text-xs">Eligibility & Requirements</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedOpportunity.eligibility}</p>
                    <div className="pt-2 flex flex-wrap gap-4 text-[11px] font-bold text-gray-600">
                      <span>📍 Location: {selectedOpportunity.location}</span>
                      <span>💰 Stipend/Reward: {selectedOpportunity.stipend_reward}</span>
                      <span>⏰ Deadline: {selectedOpportunity.deadline}</span>
                    </div>
                  </div>

                  {/* Student Application Form */}
                  <form onSubmit={handleSubmitApplication} className="space-y-4">
                    <h4 className="font-extrabold uppercase tracking-wider text-gray-900 text-xs border-b border-gray-100 pb-2">
                      Submit Your Application
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">Full Student Name *</label>
                        <input
                          type="text"
                          required
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          placeholder="e.g. Samuel K. Mensah"
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#014900] transition-all text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">Student Index / Reg Number *</label>
                        <input
                          type="text"
                          required
                          value={indexNumber}
                          onChange={(e) => setIndexNumber(e.target.value)}
                          placeholder="e.g. 01/2024/0982D"
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#014900] transition-all text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">Technical University *</label>
                        <select
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#014900] transition-all text-xs font-medium"
                        >
                          <option value="Accra Technical University">Accra Technical University</option>
                          <option value="Kumasi Technical University">Kumasi Technical University</option>
                          <option value="Takoradi Technical University">Takoradi Technical University</option>
                          <option value="Cape Coast Technical University">Cape Coast Technical University</option>
                          <option value="Koforidua Technical University">Koforidua Technical University</option>
                          <option value="Ho Technical University">Ho Technical University</option>
                          <option value="Tamale Technical University">Tamale Technical University</option>
                          <option value="Sunyani Technical University">Sunyani Technical University</option>
                          <option value="Bolgatanga Technical University">Bolgatanga Technical University</option>
                          <option value="Wa Technical University">Wa Technical University</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="student@atu.edu.gh"
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#014900] transition-all text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">Phone Number (WhatsApp) *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+233 24 000 0000"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#014900] transition-all text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">Brief Statement of Interest *</label>
                      <textarea
                        rows={3}
                        required
                        value={statement}
                        onChange={(e) => setStatement(e.target.value)}
                        placeholder="Explain why you are qualified for this placement/grant..."
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#014900] transition-all text-xs"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsApplyModalOpen(false)}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 font-extrabold uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#014900] text-white font-extrabold uppercase tracking-wider rounded-xl hover:bg-[#003800] transition-colors shadow-md flex items-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5 text-[#D9A000]" />
                        <span>Submit Application</span>
                      </button>
                    </div>
                  </form>
                </>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
