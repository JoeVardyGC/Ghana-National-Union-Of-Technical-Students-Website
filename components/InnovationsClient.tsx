'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  User, 
  ArrowRight, 
  Zap,
  Heart,
  ThumbsUp,
  PlusCircle,
  X,
  CheckCircle2,
  Sparkles,
  Search,
  SlidersHorizontal,
  Flame,
  Award,
  Cpu,
  Compass,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Play,
  Image as ImageIcon,
  Info
} from 'lucide-react';
import DirectImageUploader from '@/components/DirectImageUploader';

export interface InnovationItem {
  id: number;
  title: string;
  description: string;
  project_image?: string;
  video_url?: string;
  institution?: string;
  student_name?: string;
  status?: string;
  created_at?: string;
  category?: string;
  upvotes?: number;
  pdf_url?: string;
}

const DEFAULT_INNOVATIONS: InnovationItem[] = [];

const GHANA_INSTITUTIONS = [
  "Kumasi Technical University (KsTU)",
  "Accra Technical University (ATU)",
  "Takoradi Technical University (TTU)",
  "Cape Coast Technical University (CCTU)",
  "Koforidua Technical University (KTU)",
  "Sunyani Technical University (STU)",
  "Ho Technical University (HTU)",
  "Tamale Technical University (TaTU)",
  "Bolgatanga Technical University (BTU)",
  "Wa Technical University (WTU)"
];

const DISCIPLINE_CATEGORIES = [
  "All Disciplines",
  "Renewable Energy",
  "Robotics & Automation",
  "AgTech & Automation",
  "Software & AI",
  "Mechanical Engineering",
  "Medical Technology"
];

function getCategoryColor(cat?: string) {
  switch (cat) {
    case "Renewable Energy":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30";
    case "Medical Technology":
      return "bg-rose-500/10 text-rose-700 border-rose-500/30";
    case "Mechanical Engineering":
      return "bg-slate-500/10 text-slate-800 border-slate-500/30";
    case "AgTech & Automation":
      return "bg-amber-500/10 text-amber-800 border-amber-500/30";
    case "Software & AI":
      return "bg-blue-500/10 text-blue-700 border-blue-500/30";
    default:
      return "bg-gray-500/10 text-gray-800 border-gray-500/30";
  }
}

export default function InnovationsClient({ dbInnovations = [] }: { dbInnovations?: InnovationItem[] }) {
  const initialList = dbInnovations;

  const [innovationsList] = useState<InnovationItem[]>(initialList);
  const [upvotedIds, setUpvotedIds] = useState<number[]>([]);
  const [upvoteCounts, setUpvoteCounts] = useState<{ [id: number]: number }>({});
  
  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Disciplines');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Submit Project Modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    student_name: '',
    institution: '',
    category: DISCIPLINE_CATEGORIES[1],
    description: '',
    video_url: '',
    project_image: '',
    image2: '',
    image3: '',
    image4: '',
    image5: ''
  });

  // Reset pagination on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Load upvote state from localStorage
  useEffect(() => {
    try {
      const savedUpvotes = localStorage.getItem('gnuts_upvoted_projects');
      if (savedUpvotes) {
        setUpvotedIds(JSON.parse(savedUpvotes));
      }
    } catch {}

    const counts: { [id: number]: number } = {};
    initialList.forEach((item) => {
      counts[item.id] = item.upvotes || 100 + (item.id * 12);
    });
    setUpvoteCounts(counts);
  }, [dbInnovations]);

  // Handle Upvote click
  const handleUpvote = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    const isAlreadyUpvoted = upvotedIds.includes(id);
    let newUpvotedIds: number[];
    let newCount = upvoteCounts[id] || 100;

    if (isAlreadyUpvoted) {
      newUpvotedIds = upvotedIds.filter((item) => item !== id);
      newCount -= 1;
    } else {
      newUpvotedIds = [...upvotedIds, id];
      newCount += 1;
    }

    setUpvotedIds(newUpvotedIds);
    setUpvoteCounts({ ...upvoteCounts, [id]: newCount });

    try {
      localStorage.setItem('gnuts_upvoted_projects', JSON.stringify(newUpvotedIds));
    } catch {}
  };

  // Filtered List Computation
  const filteredInnovations = useMemo(() => {
    return innovationsList.filter((item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.institution && item.institution.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.student_name && item.student_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = 
        selectedCategory === 'All Disciplines' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [innovationsList, searchQuery, selectedCategory]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredInnovations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedInnovations = filteredInnovations.slice(startIndex, endIndex);

  // Submit Modal Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/innovations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit innovation project. Please try again.');
      }

      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setIsSubmitModalOpen(false);
        setFormData({
          title: '',
          student_name: '',
          institution: '',
          category: DISCIPLINE_CATEGORIES[1],
          description: '',
          video_url: '',
          project_image: '',
          image2: '',
          image3: '',
          image4: '',
          image5: ''
        });
      }, 3000);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while submitting your project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resolve Image Path
  const getImagePath = (img?: string) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    if (img.startsWith('uploads/')) return `/${img}`;
    return `/uploads/innovations/${img}`;
  };

  return (
    <div className="py-4 sm:py-8 lg:py-10 space-y-6 sm:space-y-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 font-sans">
      
      {/* 1. HERO CTA BANNER & STATS DISPLAY */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#014900] via-[#025c00] to-[#013300] text-white p-5 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl shadow-xl border border-emerald-800/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-[#D9A000]/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-8">
          <div className="space-y-2.5 sm:space-y-4 max-w-2xl">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              Empowering Student Innovators & Industrial Pioneers
            </h2>

            <p className="text-xs sm:text-sm lg:text-base text-gray-100 font-medium leading-relaxed">
              Explore groundbreaking technical prototypes, renewable energy solutions, and agricultural automation engineered by Technical University students across Ghana.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-4 bg-[#D9A000] hover:bg-yellow-500 active:scale-95 text-[#014900] text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all duration-300 shadow-xl cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Submit Your Innovation</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & DISCIPLINE FILTER BAR */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80 lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, students, institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-xs font-medium focus:bg-white focus:border-[#014900] focus:ring-2 focus:ring-[#014900]/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Discipline Filters Swipeable Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto touch-pan-x w-full md:w-auto pb-1 md:pb-0 no-scrollbar scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
            <SlidersHorizontal className="w-4 h-4 text-[#014900] shrink-0 hidden lg:block" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 hidden lg:block">Filter:</span>
            {DISCIPLINE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 sm:px-4 py-2 text-[11px] sm:text-xs font-extrabold rounded-xl sm:rounded-2xl uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#014900] text-white border-[#014900] shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 3. INNOVATIONS GRID SECTION */}
      <section className="space-y-8">
        {filteredInnovations.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
            <div className="text-4xl mb-3">💡</div>
            <p className="text-gray-500 font-medium text-xs sm:text-sm">
              {searchQuery || selectedCategory !== 'All Disciplines'
                ? `No student projects found matching "${searchQuery || selectedCategory}". Try searching another keyword or discipline.`
                : 'No student innovative projects published yet. Check back soon for new student prototypes.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {paginatedInnovations.map((item, idx) => {
                const imgSrc = getImagePath(item.project_image);
                const isGold = idx % 2 === 1;

                return (
                  <Link
                    key={item.id}
                    href={`/innovations/${item.id}`}
                    className="bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl border border-gray-200 flex flex-col justify-between cursor-pointer transition-all duration-300 group overflow-hidden hover:-translate-y-1 min-w-0 w-full"
                  >
                    <div className="min-w-0">
                      {/* Project Image Banner */}
                      <div className="relative w-full h-48 sm:h-56 md:h-60 bg-gray-900 overflow-hidden flex items-center justify-center rounded-t-2xl sm:rounded-t-3xl shrink-0">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <Zap className="w-12 h-12 text-white/40" />
                        )}
                        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#D9A000] z-10" />
                      </div>

                      {/* Content Block */}
                      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 min-w-0">
                        {/* Meta Tags: Institution & Student */}
                        <div className="space-y-1.5 text-xs text-gray-500 font-semibold border-b border-gray-100 pb-3 min-w-0">
                          {item.institution && (
                            <div className="flex items-center gap-1.5 text-gray-800 font-bold min-w-0">
                              <Building2 className={`w-3.5 h-3.5 shrink-0 ${isGold ? 'text-[#D9A000]' : 'text-[#014900]'}`} />
                              <span className="truncate text-[11px] sm:text-xs">{item.institution}</span>
                            </div>
                          )}
                          {item.student_name && (
                            <div className="flex items-center gap-1.5 text-gray-500 min-w-0">
                              <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate text-[11px] sm:text-xs">Developer: {item.student_name}</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className={`text-base sm:text-lg font-black text-gray-900 transition-colors leading-snug uppercase break-words line-clamp-2 ${
                          isGold ? 'group-hover:text-[#D9A000]' : 'group-hover:text-[#014900]'
                        }`}>
                          {item.title}
                        </h3>

                        {/* Description Excerpt */}
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3 font-normal break-words">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* View Project Button (Gold & Green Alternating) */}
                    <div className="p-4 sm:p-6 pt-0">
                      <span className={`inline-flex items-center justify-center w-full px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-black uppercase tracking-wider sm:tracking-widest rounded-xl sm:rounded-2xl transition-all duration-300 shadow-xs ${
                        isGold
                          ? 'bg-[#D9A000] group-hover:bg-yellow-600 text-white'
                          : 'bg-[#014900] group-hover:bg-[#013300] text-white'
                      }`}>
                        <span>Explore Project</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination Controls Bar */}
            {totalPages > 1 && (
              <div className="pt-6 sm:pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500 font-medium text-center sm:text-left">
                  Showing <strong className="text-gray-900">{startIndex + 1}</strong> to <strong className="text-gray-900">{Math.min(endIndex, filteredInnovations.length)}</strong> of <strong className="text-gray-900">{filteredInnovations.length}</strong> innovative projects
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                  {/* Prev Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 text-xs font-extrabold uppercase rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {/* Page Number Tabs [ 1 ] [ 2 ] */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#014900] text-white border-[#014900] shadow-xs scale-105'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#014900] hover:text-[#014900]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 text-xs font-extrabold uppercase rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SUBMIT PROJECT MODAL DIALOG */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn font-sans">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#014900] text-white px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b-4 border-b-[#D9A000]">
              <div className="flex items-center gap-2 min-w-0">
                <PlusCircle className="w-5 h-5 text-[#D9A000] shrink-0" />
                <h3 className="text-xs sm:text-base font-extrabold uppercase tracking-wider truncate">
                  Submit Student Innovation Project
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-4 sm:space-y-6 flex-grow">
              {submittedSuccess ? (
                <div className="py-8 sm:py-12 text-center space-y-4">
                  <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-600 mx-auto animate-bounce" />
                  <h4 className="text-lg sm:text-xl font-extrabold text-gray-900">
                    Project Submitted Successfully!
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                    Thank you! Your project details have been sent to the GNUTS Secretariat. Our TVET vetting committee will review your submission shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                  {submitError && (
                    <div className="p-3 sm:p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl sm:rounded-2xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* 1. Project Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700 uppercase">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Automated Solar Grain Dryer"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2.5 border border-gray-300 rounded-xl sm:rounded-2xl text-xs focus:ring-2 focus:ring-[#014900] focus:border-[#014900] outline-none"
                    />
                  </div>

                  {/* 2. Demonstration Video Link (Optional) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-extrabold text-gray-700 uppercase flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-[#014900]" />
                        <span>Video Link (Optional)</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">OPTIONAL</span>
                    </div>
                    <input
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2.5 border border-gray-300 rounded-xl sm:rounded-2xl text-xs focus:ring-2 focus:ring-[#014900] focus:border-[#014900] outline-none bg-white"
                    />
                  </div>

                  {/* 3. Developer Name & Technical Institution */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700 uppercase">
                        Developer / Team Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kwame Mensah & Team"
                        value={formData.student_name}
                        onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 border border-gray-300 rounded-xl sm:rounded-2xl text-xs focus:ring-2 focus:ring-[#014900] focus:border-[#014900] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700 uppercase">
                        Technical Institution *
                      </label>
                      <input
                        type="text"
                        required
                        list="ghana-institutions"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        placeholder="e.g. Takoradi Technical University"
                        className="w-full px-3.5 sm:px-4 py-2.5 border border-gray-300 rounded-xl sm:rounded-2xl text-xs focus:ring-2 focus:ring-[#014900] focus:border-[#014900] outline-none bg-white font-medium"
                      />
                      <datalist id="ghana-institutions">
                        {GHANA_INSTITUTIONS.map((inst, idx) => (
                          <option key={idx} value={inst} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* 4. Discipline Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700 uppercase">
                      Technical Discipline Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2.5 border border-gray-300 rounded-xl sm:rounded-2xl text-xs focus:ring-2 focus:ring-[#014900] focus:border-[#014900] outline-none bg-white font-medium"
                    >
                      {DISCIPLINE_CATEGORIES.filter(c => c !== 'All Disciplines').map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* 5. Main Cover Picture Link */}
                  <div className="space-y-2 bg-gray-50/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-[#014900] uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-[#014900]" />
                        <span>Main Project Cover Photo Link *</span>
                      </label>
                      <span className="text-[10px] bg-[#014900] text-white px-2 py-0.5 rounded-full font-bold">REQUIRED</span>
                    </div>

                    <input
                      type="url"
                      required
                      placeholder="e.g. https://res.cloudinary.com/... or direct image link"
                      value={formData.project_image}
                      onChange={(e) => setFormData({ ...formData, project_image: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#014900] outline-none bg-white font-medium"
                    />

                    {/* Instructions */}
                    <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold block">How to get your image link:</span>
                        <span>Log into <strong>Cloudinary</strong> (or free image hosting like <strong>Postimages.org</strong> / <strong>ImgBB.com</strong>), upload your prototype picture, copy the direct image link, and paste it here.</span>
                      </div>
                    </div>

                    {/* Preview Thumbnail */}
                    {formData.project_image && (
                      <div className="mt-2 relative w-32 h-20 rounded-xl overflow-hidden border border-gray-300 shadow-xs bg-gray-900">
                        <img
                          src={formData.project_image}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                          Cover Preview
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 6. Optional Additional Photos */}
                  <div className="space-y-2 bg-gray-50/70 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-200">
                    <label className="text-xs font-extrabold text-gray-700 uppercase block">
                      Additional Project Photos (Optional Links)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="url"
                        placeholder="Additional Photo 2 Link (Optional)"
                        value={formData.image2 || ''}
                        onChange={(e) => setFormData({ ...formData, image2: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#014900] outline-none bg-white"
                      />
                      <input
                        type="url"
                        placeholder="Additional Photo 3 Link (Optional)"
                        value={formData.image3 || ''}
                        onChange={(e) => setFormData({ ...formData, image3: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#014900] outline-none bg-white"
                      />
                    </div>
                  </div>

                  {/* 7. Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700 uppercase">
                      Detailed Project Overview & Specifications *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe the problem, engineering solution, components used, and target community impact..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2.5 border border-gray-300 rounded-xl sm:rounded-2xl text-xs focus:ring-2 focus:ring-[#014900] focus:border-[#014900] outline-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-3 sm:pt-4 flex items-center justify-end gap-2 sm:gap-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsSubmitModalOpen(false)}
                      className="px-4 sm:px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl sm:rounded-2xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 sm:px-6 py-2.5 bg-[#014900] hover:bg-[#013300] text-white text-xs font-black uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Project</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
