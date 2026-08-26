'use client';

import React, { useState, useMemo } from 'react';
import {
  Images,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Upload,
  Calendar,
  ShieldCheck,
  Maximize2,
  X,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Award,
  Layers,
  CheckSquare,
  Square
} from 'lucide-react';
import { resolveImgUrl } from '@/lib/imageUtils';

export interface AdminGalleryItem {
  id: number;
  title: string;
  category: 'LEADERSHIP' | 'CONGRESS' | 'PROJECTS' | 'ACTIVITIES' | string;
  image: string;
  tenure_or_date: string;
  role_or_badge: string;
  description?: string;
  display_order: number;
  created_at?: string;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Media' },
  { id: 'LEADERSHIP', label: 'Executive Leadership' },
  { id: 'CONGRESS', label: 'National Congress' },
  { id: 'PROJECTS', label: 'Student Innovations' },
  { id: 'ACTIVITIES', label: 'Union Activities' },
];

export default function GalleryManagementClient({
  initialItems,
}: {
  initialItems: AdminGalleryItem[];
}) {
  const [items, setItems] = useState<AdminGalleryItem[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<AdminGalleryItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AdminGalleryItem | null>(null);
  const [previewItem, setPreviewItem] = useState<AdminGalleryItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('LEADERSHIP');
  const [formImage, setFormImage] = useState<string>('');
  const [formTenure, setFormTenure] = useState<string>('');
  const [formRoleBadge, setFormRoleBadge] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);

  // Status & Upload
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.role_or_badge?.toLowerCase().includes(q) ||
        item.tenure_or_date?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  // Selection handlers
  const isAllSelected = filteredItems.length > 0 && filteredItems.every((it) => selectedIds.includes(it.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((it) => it.id));
    }
  };

  const handleToggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('LEADERSHIP');
    setFormImage('');
    setFormTenure('2025/2026 Administration');
    setFormRoleBadge('National Union Archive');
    setFormDescription('');
    setFormDisplayOrder(items.length + 1);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: AdminGalleryItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category || 'LEADERSHIP');
    setFormImage(item.image);
    setFormTenure(item.tenure_or_date || '');
    setFormRoleBadge(item.role_or_badge || '');
    setFormDescription(item.description || '');
    setFormDisplayOrder(item.display_order || 1);
    setIsModalOpen(true);
  };

  // Handle Image File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setFormImage(data.url);
      showToast('success', 'Image uploaded successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Form Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim() || !formImage.trim()) {
      showToast('error', 'Title and photo image are required.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        title: formTitle.trim(),
        category: formCategory.toUpperCase(),
        image: formImage.trim(),
        tenure_or_date: formTenure.trim() || 'Archive Record',
        role_or_badge: formRoleBadge.trim() || 'Union Archive',
        description: formDescription.trim(),
        display_order: Number(formDisplayOrder) || 1,
      };

      if (editingItem) {
        // Update
        const res = await fetch(`/api/admin/gallery/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update gallery item');

        setItems((prev) =>
          prev.map((it) => (it.id === editingItem.id ? { ...it, ...payload } : it))
        );
        showToast('success', `Updated "${formTitle}" successfully.`);
      } else {
        // Create
        const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create gallery item');

        const newItem: AdminGalleryItem = {
          id: data.item?.id || Date.now(),
          ...payload,
        };

        setItems((prev) => [newItem, ...prev]);
        showToast('success', `Added "${formTitle}" to the gallery.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save gallery entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Single Delete Confirmation
  const handleDelete = async () => {
    if (!deleteCandidate) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/gallery/${deleteCandidate.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete gallery item');

      setItems((prev) => prev.filter((it) => it.id !== deleteCandidate.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteCandidate.id));
      showToast('success', `Removed "${deleteCandidate.title}" from gallery.`);
      setDeleteCandidate(null);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Bulk Delete Confirmation
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete selected items');

      setItems((prev) => prev.filter((it) => !selectedIds.includes(it.id)));
      showToast('success', `Successfully deleted ${selectedIds.length} gallery item(s).`);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
    } catch (err: any) {
      showToast('error', err.message || 'Bulk delete failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-20">
      
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold transition-all animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. Header & Overview Stats Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#014900]/10 text-[#014900] rounded-2xl">
              <Images className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
                Legacy & Leadership Gallery
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Manage historic photos, national congresses, and executive leadership portraits ({items.length} total items)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#014900] hover:bg-[#003800] text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D9A000]" />
            <span>Add Gallery Item</span>
          </button>
        </div>
      </div>

      {/* 2. Search, Multi-Select Controls & Category Filters Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Keyword Search & Select-All Checkbox */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {filteredItems.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 cursor-pointer transition-colors shrink-0"
                title={isAllSelected ? 'Deselect all items' : 'Select all matching items'}
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 text-[#014900]" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
                <span className="hidden sm:inline">Select All</span>
              </button>
            )}

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search title, badge, tenure, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:bg-white focus:border-[#014900] focus:ring-2 focus:ring-[#014900]/20 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar scrollbar-none">
            <SlidersHorizontal className="w-4 h-4 text-[#014900] shrink-0 hidden sm:block" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 hidden sm:block">Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-extrabold rounded-2xl uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#014900] text-white border-[#014900] shadow-sm font-black'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 3. Gallery Items Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-md mx-auto space-y-3">
          <Sparkles className="w-12 h-12 text-[#014900] mx-auto opacity-40" />
          <h3 className="text-lg font-extrabold text-gray-900 uppercase">No Media Found</h3>
          <p className="text-xs text-gray-500 font-medium">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'No gallery records matching the current search filters.'
              : 'No gallery archive items published yet. Click "Add Gallery Item" to create the first record.'}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
            className="px-5 py-2.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] text-xs font-extrabold uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const resolvedImg = resolveImgUrl(item.image);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-xl ${
                  isSelected
                    ? 'border-[#014900] ring-2 ring-[#014900]/20 bg-emerald-50/10'
                    : 'border-gray-200/90 hover:border-[#014900]/40'
                }`}
              >
                <div>
                  {/* Photo Thumbnail with Badges & Checkbox */}
                  <div className="relative w-full h-64 bg-gray-900 overflow-hidden shrink-0">
                    <img
                      src={resolvedImg}
                      alt={item.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                    {/* Selection Checkbox & Category Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelectOne(item.id);
                        }}
                        className="p-1.5 rounded-xl bg-black/60 backdrop-blur-xs text-white hover:bg-black/80 transition-colors cursor-pointer border border-white/20"
                        title={isSelected ? 'Deselect item' : 'Select item for deletion'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#D9A000]" />
                        ) : (
                          <Square className="w-4 h-4 text-white/80" />
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-xs text-[#D9A000] text-[10px] font-black tracking-wider border border-white/10">
                          #{item.display_order} • {item.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-[#014900]/90 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider border border-white/20">
                          {item.role_or_badge}
                        </span>
                      </div>
                    </div>

                    {/* Tenure Pill at Bottom */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-xs text-gray-200 text-[10px] font-bold border border-white/10">
                      <Calendar className="w-3 h-3 text-[#D9A000]" />
                      <span>{item.tenure_or_date}</span>
                    </div>

                    {/* Lightbox Quick View */}
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-xl bg-white/20 hover:bg-[#D9A000] text-white hover:text-[#014900] flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-md"
                      title="Inspect Photo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-sm font-black text-gray-900 uppercase leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 pt-0 border-t border-gray-100 mt-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    ID #{item.id}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-xl text-gray-600 hover:text-[#014900] hover:bg-[#014900]/10 border border-gray-200 transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate(item)}
                      className="p-2 rounded-xl text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. FLOATING BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-40 bg-gray-950/95 text-white backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-white/20 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#D9A000] text-[#014900] text-xs font-black">
              {selectedIds.length}
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-gray-200">
              {selectedIds.length === 1 ? '1 item selected' : `${selectedIds.length} items selected`}
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

      {/* 5. CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="relative bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#014900] text-white">
              <div className="flex items-center gap-2">
                <Images className="w-5 h-5 text-[#D9A000]" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  {editingItem ? `Edit Gallery Item (#${editingItem.id})` : 'Add New Gallery Item'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              
              {/* Photo Upload & Preview Container */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                  Archive Photo Image <span className="text-rose-500">*</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview Card */}
                  <div className="w-full sm:w-40 h-40 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 relative group">
                    {formImage ? (
                      <img
                        src={resolveImgUrl(formImage)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3 text-gray-400 space-y-1">
                        <Upload className="w-6 h-6 mx-auto opacity-50" />
                        <span className="text-[10px] font-bold uppercase block">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="w-full space-y-3">
                    <div>
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border border-gray-300">
                        <Upload className="w-4 h-4 text-[#014900]" />
                        <span>{isUploading ? 'Uploading...' : 'Choose Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-gray-400 font-medium mt-1">
                        Recommended: High resolution JPG/PNG (Max 5MB)
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Or enter direct image URL:
                      </span>
                      <input
                        type="text"
                        placeholder="https://res.cloudinary.com/..."
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#014900]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                  Event or Leader Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. H.E. Isaac Mensah & Leadership Executives"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium outline-none focus:bg-white focus:border-[#014900] focus:ring-2 focus:ring-[#014900]/20"
                />
              </div>

              {/* Category & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                    Archive Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-[#014900]"
                  >
                    <option value="LEADERSHIP">Executive Leadership</option>
                    <option value="CONGRESS">National Congress</option>
                    <option value="PROJECTS">Student Innovations</option>
                    <option value="ACTIVITIES">Union Activities</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                    Display Priority Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium outline-none focus:bg-white focus:border-[#014900]"
                  />
                </div>
              </div>

              {/* Role Badge & Tenure/Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                    Role or Badge Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. National President & Council"
                    value={formRoleBadge}
                    onChange={(e) => setFormRoleBadge(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium outline-none focus:bg-white focus:border-[#014900]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                    Tenure or Event Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2025/2026 Administration or March 2025"
                    value={formTenure}
                    onChange={(e) => setFormTenure(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium outline-none focus:bg-white focus:border-[#014900]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                  Description / Historical Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide background context or significance of this historic photo..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium outline-none focus:bg-white focus:border-[#014900]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-2xl hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-6 py-2.5 bg-[#014900] hover:bg-[#003800] text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Saving Record...' : editingItem ? 'Save Changes' : 'Create Gallery Item'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 6. INDIVIDUAL DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-rose-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-gray-900 uppercase">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-gray-900">"{deleteCandidate.title}"</strong> from the Legacy & Leadership Gallery? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-2xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. BULK DELETE CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-rose-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 uppercase">
                  Bulk Delete Confirmation
                </h3>
                <span className="text-xs font-bold text-rose-600">
                  {selectedIds.length} item(s) selected
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-900">{selectedIds.length} selected items</strong> from the Legacy & Leadership Gallery? This action will remove them completely and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-2xl hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Deleting...' : `Delete ${selectedIds.length} Items`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. PHOTO LIGHTBOX PREVIEW */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative bg-white max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#014900] text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D9A000]" />
                <span className="text-xs font-black uppercase tracking-wider">{previewItem.title}</span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full max-h-[60vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={resolveImgUrl(previewItem.image)}
                alt={previewItem.title}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>

            <div className="p-6 space-y-2 bg-white">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span className="px-3 py-1 bg-[#D9A000] text-[#014900] font-black rounded-full uppercase">
                  {previewItem.role_or_badge}
                </span>
                <span>{previewItem.tenure_or_date}</span>
              </div>
              <p className="text-xs text-gray-600">{previewItem.description}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
