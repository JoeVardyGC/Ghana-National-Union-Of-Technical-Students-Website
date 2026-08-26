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
    <div className="py-6 sm:py-10 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. HERO CTA BANNER & STATS DISPLAY */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#014900] via-[#025c00] to-[#013300] text-white p-8 sm:p-12 rounded-3xl shadow-2xl border border-emerald-800/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 rounded-full bg-[#D9A000]/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
              Empowering Student Innovators & Industrial Pioneers
            </h2>

            <p className="text-sm sm:text-base text-gray-100 font-medium leading-relaxed">
              Explore groundbreaking technical prototypes, renewable energy solutions, and agricultural automation engineered by Technical University students across Ghana.
            </p>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 px-7 py-4 bg-[#D9A000] hover:bg-yellow-500 active:scale-95 text-[#014900] text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Submit Your Innovation</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROL BAR */}
      {/* 2. SEARCH & DISCIPLINE FILTER BAR */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, students, or institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:bg-white focus:border-[#014900] focus:ring-2 focus:ring-[#014900]/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Discipline Filters */}
          <div className="flex items-center gap-2 overflow-x-auto touch-pan-x w-full md:w-auto pb-1 md:pb-0 no-scrollbar scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
            <SlidersHorizontal className="w-4 h-4 text-[#014900] shrink-0 hidden sm:block" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 hidden sm:block">Filter:</span>
            {DISCIPLINE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-extrabold rounded-2xl uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#014900] text-white border-[#014900] shadow-sm'
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
          <div className="text-center py-12 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
            <div className="text-4xl mb-3">💡</div>
            <p className="text-gray-500 font-medium text-sm">
              {searchQuery || selectedCategory !== 'All Disciplines'
                ? `No student projects found matching "${searchQuery || selectedCategory}". Try searching another keyword or discipline.`
                : 'No student innovative projects published yet. Check back soon for new student prototypes.'}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedInnovations.map((item, idx) => {
                const imgSrc = getImagePath(item.project_image);
                const isGold = idx % 2 === 1;

                return (
                  <Link
                    key={item.id}
                    href={`/innovations/${item.id}`}
                    className="bg-white rounded-3xl shadow-md hover:shadow-2xl border border-gray-200/90 flex flex-col justify-between cursor-pointer transition-all duration-300 group overflow-hidden hover:-translate-y-1.5"
                  >
                    <div>
                      {/* Project Image Banner */}
                      <div className="relative w-full h-64 bg-gray-900 overflow-hidden flex items-center justify-center rounded-t-3xl">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <Zap className="w-16 h-16 text-white/40" />
                        )}
                        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#D9A000] z-10" />
                      </div>

                      {/* Content Block */}
                      <div className="p-6 space-y-4">
                        {/* Meta Tags: Institution & Student */}
                        <div className="space-y-1.5 text-xs text-gray-500 font-semibold border-b border-gray-100 pb-3">
                          {item.institution && (
                            <div className="flex items-center gap-1.5 text-gray-800 font-bold truncate">
                              <Building2 className={`w-3.5 h-3.5 shrink-0 ${isGold ? 'text-[#D9A000]' : 'text-[#014900]'}`} />
                              <span className="truncate">{item.institution}</span>
                            </div>
                          )}
                          {item.student_name && (
                            <div className="flex items-center gap-1.5 text-gray-500 truncate">
                              <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate">Developer: {item.student_name}</span>
                            </div>
                          )}
                        </div>

                        {/* Non-italicized Title */}
                        <h3 className={`text-lg font-extrabold text-gray-900 transition-colors leading-snug uppercase ${
                          isGold ? 'group-hover:text-[#D9A000]' : 'group-hover:text-[#014900]'
                        }`}>
                          {item.title}
                        </h3>

                        {/* Description Excerpt */}
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 font-normal">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* View Project Button (Gold & Green Alternating) */}
                    <div className="p-6 pt-0">
                      <span className={`inline-flex items-center justify-center w-full px-5 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-sm ${
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
              <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500 font-medium">
                  Showing <strong className="text-gray-900">{startIndex + 1}</strong> to <strong className="text-gray-900">{Math.min(endIndex, filteredInnovations.length)}</strong> of <strong className="text-gray-900">{filteredInnovations.length}</strong> innovative projects
                </div>

                <div className="flex items-center gap-2">
                  {/* Prev Button */}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-extrabold uppercase rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center text-xs font-extrabold rounded-xl border transition-all ${
                          isActive
                            ? 'bg-[#014900] text-white border-[#014900] shadow-md scale-105'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#014900] hover:text-[#014900]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-extrabold uppercase rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl border-2 border-[#014900] shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#014900] text-white px-6 py-5 flex items-center justify-between border-b-4 border-b-[#D9A000] rounded-t-3xl">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#D9A000]" />
                <h3 className="text-base font-extrabold uppercase tracking-wider">
                  Submit Student Innovation Project
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-grow">
              {submittedSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
                  <h4 className="text-xl font-extrabold text-gray-900">
                    Project Submitted Successfully!
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                    Thank you! Your project details have been sent to the GNUTS Secretariat. Our TVET vetting committee will review your submission shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                  {submitError && (
                    <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2">
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl text-xs focus:ring-2 focus:ring-[#014900] focus:border-[#014900] outline-none"
                    />
                  </div>

                  {/* 2. Demonstration Video Link at the Top (Optional) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-gray-700 uppercase flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-[#014900]" />
                        <span>Demonstration Video URL (Optional)</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">NOT COMPULSORY</span>
                    </div>
                    <input
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=... (Optional prototype video)"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl text-xs focus:ring-2 focus:ring-[#014900] focus:border-[#014900] outline-none bg-white"
                    />
                  </div>

                  {/* 3. Developer Name & Technical Institution */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl text-xs focus:ring-2 focus:ring-[#014900] focus:border-[#014900] outline-none"
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
                        placeholder="e.g. Takoradi Technical University (TTU)"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl text-xs focus:ring-2 focus:ring-[#014900] focus:border-[#014900] outline-none bg-white font-medium"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl text-xs focus:ring-2 focus:ring-[#014900] focus:border-[#014900] outline-none bg-white font-medium"
                    >
                      {DISCIPLINE_CATEGORIES.filter(c => c !== 'All Disciplines').map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* 5. Main Cover Picture Link (Compulsory Link Only) */}
                  <div className="space-y-2 bg-gray-50/90 p-4 rounded-2xl border border-gray-200">
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

                    {/* Helpful instructions for students */}
                    <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold block">How to get your image link:</span>
                        <span>Log into <strong>Cloudinary</strong> (or free hosting like <strong>Postimages.org</strong> / <strong>ImgBB.com</strong>), upload your prototype picture, copy the direct image address/link, and paste it here.</span>
                      </div>
                    </div>

                    {/* Live Image Preview Thumbnail if link is provided */}
                    {formData.project_image && (
                      <div className="mt-2 relative w-32 h-20 rounded-xl overflow-hidden border border-gray-300 shadow-xs bg-gray-900 group">
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

                  {/* 6. Optional Additional Photo Links */}
                  <div className="space-y-2 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-200">
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

                  {/* 7. Detailed Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700 uppercase">
                      Detailed Project Overview & Technical Specifications *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe the problem, engineering solution, components used, and target community impact..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl text-xs focus:ring-2 focus:ring-[#014900] focus:border-[#014900] outline-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsSubmitModalOpen(false)}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-[#014900] hover:bg-[#013300] text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-70"
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
