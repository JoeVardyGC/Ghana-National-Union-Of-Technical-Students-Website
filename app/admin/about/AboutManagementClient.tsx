'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Target, 
  Eye, 
  ShieldCheck, 
  History, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink,
  ImageIcon,
  Award,
  Scale,
  Users,
  Globe,
  X
} from 'lucide-react';

export interface AboutData {
  id?: number;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  who_we_are_title: string;
  who_we_are_subtitle?: string;
  who_we_are_content: string;
  who_we_are_image: string;
  mission_title: string;
  mission_content: string;
  vision_title: string;
  vision_content: string;
  values_title: string;
  values_json?: any;
}

export interface MilestoneItem {
  id?: number;
  year: string;
  title: string;
  description: string;
  image?: string;
  tag?: string;
  display_order?: number;
}

const DEFAULT_CORE_VALUES = [
  { id: '1', title: 'Integrity', desc: 'Upholding honesty, transparency, and ethical leadership in all union activities.', num: '01' },
  { id: '2', title: 'Professionalism', desc: 'Conducting our affairs with discipline, competence, and respect.', num: '02' },
  { id: '3', title: 'Accountability', desc: 'Being responsible to our members and stakeholders at all levels.', num: '03' },
  { id: '4', title: 'Inclusiveness', desc: 'Ensuring equal representation and participation of all technical students, regardless of background or gender.', num: '04' },
  { id: '5', title: 'Innovation', desc: 'Embracing creativity and digital solutions to enhance engagement and advocacy.', num: '05' },
  { id: '6', title: 'Unity', desc: 'Strengthening solidarity among technical institutions to speak with one national voice.', num: '06' },
];

export default function AboutManagementClient({
  initialAbout,
  initialMilestones = [],
}: {
  initialAbout: AboutData;
  initialMilestones?: MilestoneItem[];
}) {
  const [activeTab, setActiveTab] = useState<'hero' | 'who_we_are' | 'mission_vision' | 'milestones'>('hero');
  const [aboutForm, setAboutForm] = useState<AboutData>(initialAbout);
  const [coreValues, setCoreValues] = useState<any[]>(
    initialAbout.values_json ? (Array.isArray(initialAbout.values_json) ? initialAbout.values_json : DEFAULT_CORE_VALUES) : DEFAULT_CORE_VALUES
  );
  const [milestonesList, setMilestonesList] = useState<MilestoneItem[]>(initialMilestones);

  // Status & Notifications
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Milestone Modal State
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneItem | null>(null);
  const [milestoneFormData, setMilestoneFormData] = useState<MilestoneItem>({
    year: '',
    title: '',
    tag: '',
    description: '',
    image: '',
    display_order: 1,
  });
  const [isUploadingMilestoneImg, setIsUploadingMilestoneImg] = useState(false);
  const [isUploadingHeroImg, setIsUploadingHeroImg] = useState(false);
  const [isUploadingAboutImg, setIsUploadingAboutImg] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Image Upload Helper
  const handleImageUpload = async (file: File, target: 'hero' | 'about' | 'milestone') => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    if (target === 'hero') setIsUploadingHeroImg(true);
    if (target === 'about') setIsUploadingAboutImg(true);
    if (target === 'milestone') setIsUploadingMilestoneImg(true);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (target === 'hero') setAboutForm(prev => ({ ...prev, hero_image: data.url }));
        if (target === 'about') setAboutForm(prev => ({ ...prev, who_we_are_image: data.url }));
        if (target === 'milestone') setMilestoneFormData(prev => ({ ...prev, image: data.url }));
        showToast('Image uploaded successfully.');
      } else {
        showToast(data.message || 'Image upload failed.', 'error');
      }
    } catch {
      showToast('Network error during image upload.', 'error');
    } finally {
      setIsUploadingHeroImg(false);
      setIsUploadingAboutImg(false);
      setIsUploadingMilestoneImg(false);
    }
  };

  // Save About Page Details
  const handleSaveAboutDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...aboutForm,
        values_json: coreValues,
      };

      const res = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast('About page content saved and published to live website!');
      } else {
        showToast(data.message || 'Failed to save about page.', 'error');
      }
    } catch {
      showToast('Network error while updating about page.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Add Milestone Modal
  const handleOpenAddMilestone = () => {
    setEditingMilestone(null);
    setMilestoneFormData({
      year: new Date().getFullYear().toString(),
      title: '',
      tag: 'UNION MILESTONE',
      description: '',
      image: '',
      display_order: milestonesList.length + 1,
    });
    setIsMilestoneModalOpen(true);
  };

  // Open Edit Milestone Modal
  const handleOpenEditMilestone = (m: MilestoneItem) => {
    setEditingMilestone(m);
    setMilestoneFormData({ ...m });
    setIsMilestoneModalOpen(true);
  };

  // Save Milestone (Create or Update)
  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneFormData.year || !milestoneFormData.title || !milestoneFormData.description) {
      showToast('Please fill all required milestone fields.', 'error');
      return;
    }

    try {
      if (editingMilestone && editingMilestone.id) {
        // Update
        const res = await fetch(`/api/admin/about/milestones/${editingMilestone.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(milestoneFormData),
        });
        const data = await res.json();
        if (data.success) {
          setMilestonesList(prev =>
            prev.map(item => (item.id === editingMilestone.id ? { ...item, ...milestoneFormData } : item))
          );
          setIsMilestoneModalOpen(false);
          showToast('History milestone updated.');
        } else {
          showToast(data.message || 'Update failed.', 'error');
        }
      } else {
        // Create
        const res = await fetch('/api/admin/about/milestones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(milestoneFormData),
        });
        const data = await res.json();
        if (data.success) {
          const newItem = { ...milestoneFormData, id: data.id || Date.now() };
          setMilestonesList(prev => [...prev, newItem].sort((a, b) => Number(a.year) - Number(b.year)));
          setIsMilestoneModalOpen(false);
          showToast('New history milestone created.');
        } else {
          showToast(data.message || 'Creation failed.', 'error');
        }
      }
    } catch {
      showToast('Network error while saving milestone.', 'error');
    }
  };

  // Delete Milestone
  const handleDeleteMilestone = async (id?: number) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this history milestone?')) return;

    try {
      const res = await fetch(`/api/admin/about/milestones/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMilestonesList(prev => prev.filter(m => m.id !== id));
        showToast('Milestone removed from timeline.');
      } else {
        showToast(data.message || 'Delete failed.', 'error');
      }
    } catch {
      showToast('Network error while deleting milestone.', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 font-['Montserrat',sans-serif]">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-bold animate-fadeInUp ${
          toastMessage.type === 'success' ? 'bg-[#014900] text-white border-emerald-500' : 'bg-red-700 text-white border-red-500'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-[#D9A000]" /> : <AlertCircle className="w-5 h-5 text-white" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#014900] text-white flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6 text-[#D9A000]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#014900] tracking-tight">
                About Page & Union History CMS
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                Manage hero pictures, who we are narrative, mission, vision, core values, and historical timeline milestones
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-[#014900] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
          >
            <ExternalLink className="w-4 h-4 text-[#014900]" />
            <span>Preview Live Page</span>
          </Link>
          <button
            onClick={() => handleSaveAboutDetails()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-[#014900] hover:bg-[#003800] shadow-md hover:shadow-xl transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#D9A000]" />
            <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-200/70 rounded-2xl overflow-x-auto no-scrollbar scrollbar-none">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'hero' ? 'bg-white text-[#014900] shadow-md' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-[#D9A000]" />
          <span>1. Hero & Top Banner</span>
        </button>

        <button
          onClick={() => setActiveTab('who_we_are')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'who_we_are' ? 'bg-white text-[#014900] shadow-md' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#D9A000]" />
          <span>2. Who We Are & Story</span>
        </button>

        <button
          onClick={() => setActiveTab('mission_vision')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'mission_vision' ? 'bg-white text-[#014900] shadow-md' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="w-4 h-4 text-[#D9A000]" />
          <span>3. Mission, Vision & Values</span>
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'milestones' ? 'bg-white text-[#014900] shadow-md' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <History className="w-4 h-4 text-[#D9A000]" />
          <span>4. History Timeline ({milestonesList.length})</span>
        </button>
      </div>

      {/* TAB 1: HERO & HEADER IMAGERY */}
      {activeTab === 'hero' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-black text-[#014900] tracking-tight">Top Hero Header & Background Picture</h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Configure the main banner title, subtitle, and top hero background image.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={aboutForm.hero_title}
                  onChange={(e) => setAboutForm({ ...aboutForm, hero_title: e.target.value })}
                  placeholder="e.g. About GNUTS"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#014900] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Hero Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={aboutForm.hero_subtitle}
                  onChange={(e) => setAboutForm({ ...aboutForm, hero_subtitle: e.target.value })}
                  placeholder="e.g. Empowering Technical & TVET Students Across Ghana"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#014900] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Hero Background Image (Picture At Top)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={aboutForm.hero_image}
                    onChange={(e) => setAboutForm({ ...aboutForm, hero_image: e.target.value })}
                    placeholder="https://... or upload image"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#014900] focus:bg-white"
                  />
                  <label className="shrink-0 inline-flex items-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-[#014900] border border-emerald-200 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingHeroImg ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'hero')}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Live Visual Preview of Hero Header */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-black uppercase text-gray-400 tracking-wider block">Live Banner Preview</span>
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-gray-900 aspect-video flex items-center justify-center p-6 text-center">
                <img
                  src={aboutForm.hero_image || 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg'}
                  alt="Hero Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#014900]/60 backdrop-brightness-90" />
                <div className="relative z-10 space-y-2 text-white">
                  <h3 className="text-2xl font-black uppercase tracking-tight">{aboutForm.hero_title || 'About GNUTS'}</h3>
                  <p className="text-xs text-gray-200 font-medium line-clamp-2">{aboutForm.hero_subtitle || 'Tagline here'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHO WE ARE & UNION STORY */}
      {activeTab === 'who_we_are' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-black text-[#014900] tracking-tight">Who We Are & Union Narrative</h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Edit the comprehensive overview, representative history, and featured delegation picture.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={aboutForm.who_we_are_title}
                  onChange={(e) => setAboutForm({ ...aboutForm, who_we_are_title: e.target.value })}
                  placeholder="e.g. Who We Are"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#014900] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Main Narrative Content
                </label>
                <textarea
                  rows={8}
                  value={aboutForm.who_we_are_content}
                  onChange={(e) => setAboutForm({ ...aboutForm, who_we_are_content: e.target.value })}
                  placeholder="The Ghana National Union of Technical Students (GNUTS) is..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#014900] focus:bg-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Featured Graphic Picture
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={aboutForm.who_we_are_image}
                    onChange={(e) => setAboutForm({ ...aboutForm, who_we_are_image: e.target.value })}
                    placeholder="https://... or upload photo"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#014900] focus:bg-white"
                  />
                  <label className="shrink-0 inline-flex items-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-[#014900] border border-emerald-200 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingAboutImg ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'about')}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Featured Image Live Preview */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-black uppercase text-gray-400 tracking-wider block">Featured Story Photo Preview</span>
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-gray-900 h-80">
                <img
                  src={aboutForm.who_we_are_image || 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg'}
                  alt="Story Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-black text-[#D9A000] uppercase tracking-wider">Union Delegation Graphic</p>
                  <p className="text-sm font-bold mt-0.5">Uniting Ghana's Technical Universities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MISSION, VISION & CORE VALUES */}
      {activeTab === 'mission_vision' && (
        <div className="space-y-8">
          {/* Mission & Vision Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-[#014900] tracking-tight">Mission & Vision Statements</h2>
              <p className="text-xs text-gray-500 font-medium mt-1">Configure the authoritative strategic mandate of the National Union.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mission Box */}
              <div className="p-6 rounded-3xl bg-emerald-50/50 border-2 border-emerald-800/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#014900] text-white flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#D9A000]" />
                  </div>
                  <input
                    type="text"
                    value={aboutForm.mission_title}
                    onChange={(e) => setAboutForm({ ...aboutForm, mission_title: e.target.value })}
                    placeholder="Our Mission"
                    className="font-black text-lg text-[#014900] bg-transparent border-b border-emerald-300 focus:outline-none w-full"
                  />
                </div>
                <textarea
                  rows={6}
                  value={aboutForm.mission_content}
                  onChange={(e) => setAboutForm({ ...aboutForm, mission_content: e.target.value })}
                  placeholder="Mission statement details..."
                  className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed focus:ring-2 focus:ring-[#014900] focus:outline-none"
                />
              </div>

              {/* Vision Box */}
              <div className="p-6 rounded-3xl bg-amber-50/50 border-2 border-amber-800/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D9A000] text-[#014900] flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="text"
                    value={aboutForm.vision_title}
                    onChange={(e) => setAboutForm({ ...aboutForm, vision_title: e.target.value })}
                    placeholder="Our Vision"
                    className="font-black text-lg text-[#014900] bg-transparent border-b border-amber-300 focus:outline-none w-full"
                  />
                </div>
                <textarea
                  rows={6}
                  value={aboutForm.vision_content}
                  onChange={(e) => setAboutForm({ ...aboutForm, vision_content: e.target.value })}
                  placeholder="Vision statement details..."
                  className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed focus:ring-2 focus:ring-[#014900] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Core Values Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-[#014900] tracking-tight">Core Values Matrix (6 Pillars)</h2>
              <p className="text-xs text-gray-500 font-medium mt-1">Customize the union's foundational ethos and guiding principles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreValues.map((val, idx) => (
                <div key={val.id || idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-[#014900] text-white flex items-center justify-center font-black text-xs">
                      {val.num || `0${idx + 1}`}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Pillar #{idx + 1}</span>
                  </div>

                  <input
                    type="text"
                    value={val.title}
                    onChange={(e) => {
                      const updated = [...coreValues];
                      updated[idx].title = e.target.value;
                      setCoreValues(updated);
                    }}
                    placeholder="Value Name"
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#014900] focus:outline-none"
                  />

                  <textarea
                    rows={2}
                    value={val.desc}
                    onChange={(e) => {
                      const updated = [...coreValues];
                      updated[idx].desc = e.target.value;
                      setCoreValues(updated);
                    }}
                    placeholder="Description..."
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: UNION HISTORY TIMELINE & PICTURES */}
      {activeTab === 'milestones' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-xl font-black text-[#014900] tracking-tight">Historical Milestones & Pictures</h2>
              <p className="text-xs text-gray-500 font-medium mt-1">Chronological timeline of union establishment, declarations, and conversions.</p>
            </div>

            <button
              onClick={handleOpenAddMilestone}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#014900] hover:bg-[#003800] text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4 text-[#D9A000]" />
              <span>Add Milestone</span>
            </button>
          </div>

          {milestonesList.length === 0 ? (
            <div className="text-center py-16 px-6 bg-gray-50 rounded-3xl border border-gray-200 max-w-md mx-auto space-y-3">
              <History className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-bold text-gray-700 text-sm">No Milestones Recorded</h3>
              <p className="text-xs text-gray-500">Click &quot;Add Milestone&quot; to begin building the official timeline.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {milestonesList.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-4 py-1.5 bg-[#014900] text-white font-black text-sm rounded-full shadow-xs">
                        {m.year}
                      </span>
                      {m.tag && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#D9A000] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          {m.tag}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-[#014900] group-hover:text-[#D9A000] transition-colors">
                      {m.title}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed font-medium line-clamp-3">
                      {m.description}
                    </p>

                    {m.image && (
                      <div className="h-40 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={m.image.startsWith('http') ? m.image : `/${m.image}`}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400">Order: #{m.display_order || idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditMilestone(m)}
                        className="p-2 rounded-xl text-gray-600 hover:text-[#014900] hover:bg-emerald-50 border border-gray-200 transition-colors"
                        title="Edit Milestone"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMilestone(m.id)}
                        className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
                        title="Delete Milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT MILESTONE */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 animate-fadeInUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-black text-xl text-[#014900]">
                {editingMilestone ? 'Edit History Milestone' : 'Add History Milestone'}
              </h3>
              <button
                onClick={() => setIsMilestoneModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMilestone} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                    Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={milestoneFormData.year}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, year: e.target.value })}
                    placeholder="e.g. 1987 or 2016"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#014900]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                    Tag / Category
                  </label>
                  <input
                    type="text"
                    value={milestoneFormData.tag}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, tag: e.target.value })}
                    placeholder="e.g. UNION FOUNDING"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#014900]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  value={milestoneFormData.title}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
                  placeholder="e.g. The Tamale Declaration"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#014900]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  Historical Narrative / Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={milestoneFormData.description}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })}
                  placeholder="Detailed description of what happened..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#014900] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  Milestone Picture / Document Photo
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={milestoneFormData.image}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, image: e.target.value })}
                    placeholder="https://... or upload picture"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#014900]"
                  />
                  <label className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 bg-emerald-50 text-[#014900] border border-emerald-200 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingMilestoneImg ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'milestone')}
                    />
                  </label>
                </div>
                {milestoneFormData.image && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden bg-gray-100 border">
                    <img
                      src={milestoneFormData.image.startsWith('http') ? milestoneFormData.image : `/${milestoneFormData.image}`}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-[#014900] hover:bg-[#003800] shadow-md"
                >
                  {editingMilestone ? 'Save Milestone' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
