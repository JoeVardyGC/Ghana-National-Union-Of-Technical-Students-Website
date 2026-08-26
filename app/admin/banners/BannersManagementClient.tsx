'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Images, 
  Sparkles, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  LayoutTemplate, 
  Save, 
  X, 
  ArrowUpRight,
  Eye,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Upload,
  RefreshCw,
  CheckSquare,
  Square
} from 'lucide-react';
import DirectImageUploader from '@/components/DirectImageUploader';

export interface BannerItem {
  id: number;
  page_key: string;
  title: string;
  image_url: string;
  display_order?: number;
  status?: string;
}

interface BannersManagementClientProps {
  initialBanners: BannerItem[];
}

const PAGE_HERO_SLOTS = [
  {
    key: 'about_hero',
    name: 'About GNUTS Page Header',
    route: '/about',
    description: 'Header background banner displayed at the top of the About GNUTS page.',
    defaultTitle: 'About GNUTS',
    defaultSubtitle: 'Empowering Technical & TVET Students Across Ghana',
  },
  {
    key: 'news_hero',
    name: 'News & Press Releases Page Header',
    route: '/blog',
    description: 'Header background banner displayed on the News archive and press communiqués page.',
    defaultTitle: 'News & Press Releases',
    defaultSubtitle: 'Official communiqués, event announcements, and national activities from GNUTS.',
  },
  {
    key: 'innovations_hero',
    name: 'Student Innovations Page Header',
    route: '/innovations',
    description: 'Header background banner for the student engineering and technology showcase page.',
    defaultTitle: 'Innovative Projects',
    defaultSubtitle: 'Showcasing groundbreaking technical innovations and engineering solutions from students across Ghana.',
  },
  {
    key: 'scholarships_hero',
    name: 'Scholarships & Aid Page Header',
    route: '/scholarships',
    description: 'Header background banner for educational grants, bursaries, and financial opportunities.',
    defaultTitle: 'Scholarships & Opportunities',
    defaultSubtitle: 'Explore educational grants, corporate bursaries, and skill development opportunities.',
  },
  {
    key: 'contact_hero',
    name: 'Contact Page Header',
    route: '/contact',
    description: 'Header background banner for the National Secretariat contact page.',
    defaultTitle: 'Contact GNUTS Secretariat',
    defaultSubtitle: 'Get in touch with the National Executive Council and regional secretariats.',
  },
  {
    key: 'resources_hero',
    name: 'Resources & Constitution Page Header',
    route: '/resources',
    description: 'Header background banner for the constitutional registry and public resources archive.',
    defaultTitle: 'Resources & Constitution',
    defaultSubtitle: 'Download official union charters, communiqués, and policy frameworks.',
  },
];

export default function BannersManagementClient({ initialBanners = [] }: BannersManagementClientProps) {
  const [bannersList, setBannersList] = useState<BannerItem[]>(initialBanners);
  const [activeTab, setActiveTab] = useState<'carousel' | 'page_headers'>('carousel');

  // Multi-Selection State for Carousel Slides
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Carousel Slide Modal State
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<BannerItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Slide Form State
  const [slideFormData, setSlideFormData] = useState({
    title: '',
    image_url: '',
    display_order: 1,
    status: 'active',
  });

  // Page Hero Header States (Key-Value map)
  const [heroFormState, setHeroFormState] = useState<Record<string, { image_url: string; status: string; isSaving?: boolean }>>(() => {
    const map: Record<string, { image_url: string; status: string }> = {};
    PAGE_HERO_SLOTS.forEach((slot) => {
      const found = initialBanners.find((b) => b.page_key === slot.key);
      map[slot.key] = {
        image_url: found?.image_url || 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
        status: found?.status || 'active',
      };
    });
    return map;
  });

  // Live Carousel Preview Index
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  // Filter carousel slides
  const carouselSlides = bannersList
    .filter((b) => b.page_key === 'home_carousel')
    .sort((a, b) => (Number(a.display_order) || 1) - (Number(b.display_order) || 1));

  // Selection handlers
  const isAllSelected = carouselSlides.length > 0 && carouselSlides.every((it) => selectedIds.includes(it.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(carouselSlides.map((it) => it.id));
    }
  };

  const handleToggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Create Slide Modal
  const handleOpenCreateSlide = () => {
    setEditingSlide(null);
    setSlideFormData({
      title: `Homepage Slide ${carouselSlides.length + 1}`,
      image_url: '',
      display_order: carouselSlides.length + 1,
      status: 'active',
    });
    setFeedbackMsg('');
    setIsSlideModalOpen(true);
  };

  // Open Edit Slide Modal
  const handleOpenEditSlide = (slide: BannerItem) => {
    setEditingSlide(slide);
    setSlideFormData({
      title: slide.title || '',
      image_url: slide.image_url || '',
      display_order: slide.display_order || 1,
      status: slide.status || 'active',
    });
    setFeedbackMsg('');
    setIsSlideModalOpen(true);
  };

  // Save Carousel Slide
  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideFormData.image_url) {
      setFeedbackMsg('Please select or upload an image for the carousel slide.');
      return;
    }

    setIsSaving(true);
    setFeedbackMsg('');

    try {
      if (editingSlide) {
        // Edit Mode
        const res = await fetch(`/api/admin/banners/${editingSlide.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...slideFormData,
            page_key: 'home_carousel',
          }),
        });

        if (res.ok) {
          setBannersList((prev) =>
            prev.map((item) =>
              item.id === editingSlide.id ? { ...item, ...slideFormData } : item
            )
          );
          setIsSlideModalOpen(false);
          setSuccessMsg('Carousel slide updated successfully!');
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          setFeedbackMsg('Failed to update slide.');
        }
      } else {
        // Create Mode
        const res = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...slideFormData,
            page_key: 'home_carousel',
          }),
        });

        const data = await res.json();
        if (res.ok && data.banner) {
          setBannersList((prev) => [...prev, data.banner]);
          setIsSlideModalOpen(false);
          setSuccessMsg('New carousel slide image added successfully!');
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          setFeedbackMsg('Failed to add slide.');
        }
      }
    } catch {
      setFeedbackMsg('Network error while saving carousel slide.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Carousel Slide
  const handleDeleteSlide = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBannersList((prev) => prev.filter((b) => b.id !== id));
        setSelectedIds((prev) => prev.filter((it) => it !== id));
        setIsDeletingId(null);
        setSuccessMsg('Slide removed from homepage carousel.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error deleting banner:', err);
    }
  };

  // Bulk Delete Carousel Slides
  const handleBulkDeleteSlides = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/banners', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        setBannersList((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
        setSuccessMsg('Selected carousel slides removed.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert('Failed to bulk delete slides');
      }
    } catch {
      alert('Network error during bulk delete');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Specific Page Hero Header
  const handleSavePageHero = async (pageKey: string, slotName: string) => {
    const data = heroFormState[pageKey];
    if (!data || !data.image_url) return;

    setHeroFormState((prev) => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], isSaving: true },
    }));

    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_key: pageKey,
          title: slotName,
          image_url: data.image_url,
          status: data.status,
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Hero banner for ${slotName} updated successfully!`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert('Failed to update hero header banner.');
      }
    } catch {
      alert('Network error updating hero header banner.');
    } finally {
      setHeroFormState((prev) => ({
        ...prev,
        [pageKey]: { ...prev[pageKey], isSaving: false },
      }));
    }
  };

  return (
    <div className="space-y-8 font-['Montserrat',sans-serif] pb-20">
      
      {/* 1. Header Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#014900] flex items-center justify-center font-bold shadow-xs">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#014900] tracking-tight uppercase">
                Hero Banners & Carousel Media
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Manage high-resolution images for the homepage slider and specific page hero headers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'carousel' && (
            <button
              onClick={handleOpenCreateSlide}
              className="px-5 py-3 rounded-2xl bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Carousel Slide</span>
            </button>
          )}

          <Link
            href="/"
            target="_blank"
            className="px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Preview Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-3xl text-xs font-bold flex items-center gap-2.5 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-[#014900] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-2 overflow-x-auto touch-pan-x sm:flex-wrap no-scrollbar scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('carousel')}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            activeTab === 'carousel'
              ? 'bg-[#014900] text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Homepage Carousel ({carouselSlides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('page_headers')}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
            activeTab === 'page_headers'
              ? 'bg-[#014900] text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Page Hero Headers ({PAGE_HERO_SLOTS.length})</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: HOMEPAGE CAROUSEL IMAGES */}
      {/* ============================================================ */}
      {activeTab === 'carousel' && (
        <div className="space-y-8">
          
          {/* Live Simulated Carousel Viewport */}
          {carouselSlides.length > 0 && (
            <div className="bg-gray-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-black text-[#D9A000] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Live Homepage Hero Carousel Preview</span>
                </div>
                <div className="text-xs text-gray-300 font-bold">
                  Slide {previewSlideIdx + 1} of {carouselSlides.length}
                </div>
              </div>

              {/* Banner Image Frame with 50% Green Overlay */}
              <div className="relative aspect-[16/7] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-black border-2 border-emerald-700/60 shadow-2xl">
                <img
                  src={carouselSlides[previewSlideIdx]?.image_url || 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg'}
                  alt="Carousel Slide"
                  className="w-full h-full object-cover object-center transition-all duration-700"
                />
                <div className="absolute inset-0 bg-[#014900]/45 backdrop-brightness-90" />
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#D9A000]" />

                {/* Simulated Overlay Typography matching Home Screen exactly */}
                <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 max-w-2xl text-left pointer-events-none">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#D9A000] bg-black/40 px-3 py-1 rounded-full self-start mb-2 backdrop-blur-xs">
                    Ghana National Union of Technical Students
                  </span>
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-white leading-tight uppercase drop-shadow-md">
                    {carouselSlides[previewSlideIdx]?.title || 'Empowering Technical Students for National Development'}
                  </h2>
                </div>

                {/* Slider Navigation arrows */}
                {carouselSlides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPreviewSlideIdx((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#D9A000] hover:text-[#014900] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewSlideIdx((prev) => (prev === carouselSlides.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#D9A000] hover:text-[#014900] transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Carousel Slide Cards Grid */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">
                  Active Carousel Slide Images ({carouselSlides.length})
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  The homepage slider automatically cycles through these active images in order.
                </p>
              </div>

              {carouselSlides.length > 0 && (
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
                  title={isAllSelected ? 'Deselect all slides' : 'Select all slides for bulk actions'}
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#014900]" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                  <span>Select All Slides</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carouselSlides.map((slide, idx) => {
                const isSelected = selectedIds.includes(slide.id);

                return (
                  <div
                    key={slide.id}
                    className={`bg-white rounded-3xl border shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group ${
                      isSelected ? 'border-[#014900] ring-2 ring-[#014900]/20 bg-emerald-50/10' : 'border-gray-200'
                    }`}
                  >
                    {/* Slide Image Header */}
                    <div className="aspect-[16/9] w-full bg-gray-900 relative overflow-hidden rounded-t-3xl">
                      <img
                        src={slide.image_url}
                        alt={slide.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Checkbox & Order badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelectOne(slide.id);
                          }}
                          className="p-1 rounded-xl bg-black/60 backdrop-blur-xs text-white hover:bg-black/80 transition-colors cursor-pointer border border-white/20"
                          title={isSelected ? 'Deselect slide' : 'Select slide for deletion'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#D9A000]" />
                          ) : (
                            <Square className="w-4 h-4 text-white/80" />
                          )}
                        </button>
                        <div className="bg-[#014900] text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm">
                          Slide #{idx + 1} (Order {slide.display_order})
                        </div>
                      </div>

                      <div className="absolute bottom-0 inset-x-0 h-1 bg-[#D9A000]" />
                    </div>

                    {/* Slide Details */}
                    <div className="p-5 flex flex-col justify-between flex-grow space-y-4 rounded-b-3xl">
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-[#014900] transition-colors line-clamp-1">
                          {slide.title || `Carousel Slide ${idx + 1}`}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-medium truncate mt-1">
                          {slide.image_url}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setPreviewSlideIdx(idx)}
                          className="text-xs font-bold text-[#014900] hover:text-[#D9A000] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditSlide(slide)}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-amber-700 transition-colors cursor-pointer"
                            title="Edit Slide Image"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDeletingId(slide.id)}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: PAGE HERO HEADERS */}
      {/* ============================================================ */}
      {activeTab === 'page_headers' && (
        <div className="space-y-8">
          <div className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200/80 text-emerald-900 text-xs leading-relaxed space-y-1">
            <h4 className="font-extrabold text-[#014900] text-sm">
              Designated Hero Header Banners
            </h4>
            <p className="text-gray-700">
              Upload custom background banners for each public page. The public page UI, responsive title typography, and 50% brand green overlay remain untouched while rendering your uploaded high-resolution imagery.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {PAGE_HERO_SLOTS.map((slot) => {
              const currentData = heroFormState[slot.key] || { image_url: '', status: 'active' };

              return (
                <div
                  key={slot.key}
                  className="bg-white rounded-3xl border border-gray-200/90 shadow-md p-6 sm:p-7 space-y-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header Slot Title */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-black text-base text-[#014900] uppercase tracking-tight">
                          {slot.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {slot.description}
                        </p>
                      </div>
                      <Link
                        href={slot.route}
                        target="_blank"
                        className="text-xs font-bold text-[#D9A000] hover:text-[#014900] flex items-center gap-1 transition-colors"
                        title="View Public Page"
                      >
                        <span>View Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Live Preview Box with Real UI Overlay */}
                    <div className="relative aspect-[16/6] rounded-2xl overflow-hidden bg-gray-900 border border-gray-300 shadow-sm">
                      <img
                        src={currentData.image_url || 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg'}
                        alt={slot.name}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-[#014900]/50 backdrop-brightness-95" />
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-[#D9A000]" />

                      {/* Header Typography */}
                      <div className="absolute inset-0 flex flex-col justify-center px-6 text-white pointer-events-none">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#D9A000] drop-shadow-xs">
                          GNUTS Public Portal
                        </span>
                        <h4 className="text-sm sm:text-base font-black uppercase tracking-tight text-white drop-shadow-sm">
                          {slot.defaultTitle}
                        </h4>
                      </div>
                    </div>

                    {/* Image Uploader */}
                    <DirectImageUploader
                      label="Header Banner Image (1920x600 Recommended)"
                      value={currentData.image_url}
                      onChange={(url) =>
                        setHeroFormState((prev) => ({
                          ...prev,
                          [slot.key]: { ...prev[slot.key], image_url: url },
                        }))
                      }
                      helperText="Supports high-res JPG, PNG, WebP up to 5MB"
                    />
                  </div>

                  {/* Save Button for Slot */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-semibold">
                      Path: {slot.route}
                    </span>
                    <button
                      type="button"
                      disabled={currentData.isSaving}
                      onClick={() => handleSavePageHero(slot.key, slot.name)}
                      className="px-5 py-2.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{currentData.isSaving ? 'Updating...' : 'Save Banner'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. FLOATING BULK ACTIONS BAR (FOR CAROUSEL SLIDES) */}
      {/* ============================================================ */}
      {selectedIds.length > 0 && activeTab === 'carousel' && (
        <div className="fixed bottom-6 inset-x-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-40 bg-gray-950/95 text-white backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-white/20 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#D9A000] text-[#014900] text-xs font-black">
              {selectedIds.length}
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-gray-200">
              {selectedIds.length === 1 ? '1 slide selected' : `${selectedIds.length} slides selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              Clear Selection
            </button>
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MODAL: CREATE / EDIT CAROUSEL SLIDE */}
      {/* ============================================================ */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 animate-fadeIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#014900] flex items-center justify-center font-bold">
                  <Images className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#014900] uppercase tracking-tight">
                    {editingSlide ? 'Edit Carousel Slide' : 'Add New Carousel Slide'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Homepage Slider Media</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackMsg && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlide} className="space-y-4">
              
              {/* Slide Title */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Slide Title / Label *
                </label>
                <input
                  type="text"
                  required
                  value={slideFormData.title}
                  onChange={(e) => setSlideFormData({ ...slideFormData, title: e.target.value })}
                  placeholder="e.g. 34th Administration National Congress Banner"
                  className="w-full px-3.5 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#014900] focus:bg-white"
                />
              </div>

              {/* Display Order */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Carousel Slide Order (Sequence)
                </label>
                <input
                  type="number"
                  min="1"
                  value={slideFormData.display_order}
                  onChange={(e) => setSlideFormData({ ...slideFormData, display_order: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#014900] focus:bg-white"
                />
              </div>

              {/* Direct Slide Image Uploader */}
              <DirectImageUploader
                label="Slide Background Image"
                value={slideFormData.image_url}
                onChange={(url) => setSlideFormData({ ...slideFormData, image_url: url })}
                helperText="Upload 1920x800px landscape photo (PNG, JPG, WebP up to 5MB)"
              />

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-[#014900] hover:bg-[#003300] text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-xl transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? 'Saving Slide...' : (editingSlide ? 'Update Slide' : 'Add Slide')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. DELETE SLIDE CONFIRMATION DIALOG */}
      {/* ============================================================ */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-gray-900">Remove Carousel Slide?</h4>
            <p className="text-xs text-gray-600 font-medium">
              This slide image will be removed from the homepage rotating banner.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSlide(isDeletingId)}
                className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. BULK DELETE SLIDES CONFIRMATION DIALOG */}
      {/* ============================================================ */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-gray-900 uppercase">
                  Bulk Remove Carousel Slides
                </h4>
                <span className="text-xs font-bold text-rose-600">
                  {selectedIds.length} slide(s) selected
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-900">{selectedIds.length} selected carousel slides</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteSlides}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Deleting...' : `Delete ${selectedIds.length} Slides`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
