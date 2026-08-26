'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Sparkles,
  Tag,
  FileCheck,
  Scale,
  Shield,
  Layers,
  CheckSquare,
  Square,
  Info
} from 'lucide-react';
import { resolveDocumentUrl } from '@/lib/imageUtils';

interface ResourceItem {
  id: number;
  title: string;
  description: string;
  category: string;
  file_path: string;
  file_name: string;
  file_size: number;
  display_order: number;
  downloads: number;
  created_at?: string;
}

const DEFAULT_RESOURCES_SEED: ResourceItem[] = [];

const RESOURCE_CATEGORIES = [
  { id: 'constitution', label: 'Constitution & Bylaws' },
  { id: 'communique', label: 'NEC Communiqués' },
  { id: 'financial', label: 'Audited Financials' },
  { id: 'policy', label: 'Policy Resolutions' },
  { id: 'academic', label: 'Academic & TVET Guides' },
];

export default function ResourcesManagementClient({
  initialResources = []
}: {
  initialResources?: ResourceItem[];
}) {
  const [resourcesList, setResourcesList] = useState<ResourceItem[]>(initialResources);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'constitution',
    file_path: '',
    file_name: '',
    file_size: 2048000,
    display_order: 1,
  });

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '2.1 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredResources = resourcesList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.file_name.toLowerCase().includes(q);
    const matchesCategory =
      categoryFilter === 'ALL' || item.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Selection handlers
  const isAllSelected = filteredResources.length > 0 && filteredResources.every((it) => selectedIds.includes(it.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredResources.map((it) => it.id));
    }
  };

  const handleToggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: 'constitution',
      file_path: '',
      file_name: '',
      file_size: 2048000,
      display_order: resourcesList.length + 1,
    });
    setFeedbackMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ResourceItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category || 'constitution',
      file_path: item.file_path || '',
      file_name: item.file_name || '',
      file_size: item.file_size || 2048000,
      display_order: item.display_order || 1,
    });
    setFeedbackMsg('');
    setIsModalOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg('');

    try {
      if (editingItem) {
        // Edit Mode
        const res = await fetch(`/api/admin/resources/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setResourcesList((prev) =>
            prev.map((item) =>
              item.id === editingItem.id ? { ...item, ...formData } : item
            )
          );
          setIsModalOpen(false);
        } else {
          setFeedbackMsg('Failed to update document');
        }
      } else {
        // Create Mode
        const res = await fetch('/api/admin/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok && data.resource) {
          setResourcesList([data.resource, ...resourcesList]);
          setIsModalOpen(false);
        } else {
          setFeedbackMsg('Failed to publish document');
        }
      }
    } catch {
      setFeedbackMsg('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResource = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResourcesList((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((it) => it !== id));
        setIsDeletingId(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete resource');
      }
    } catch {
      alert('Failed to delete resource');
    }
  };

  const handleBulkDeleteResources = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/resources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        setResourcesList((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
      } else {
        alert('Failed to bulk delete selected documents');
      }
    } catch {
      alert('Network error during bulk delete');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-['Montserrat',sans-serif] pb-20">
      
      {/* 1. Header with Stats & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#014900] tracking-tight">
            Constitution & Union Documents
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">
            Manage supreme constitution, statutory instruments, financial reports, and national policy communiqués ({resourcesList.length} total)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload New Document</span>
        </button>
      </div>

      {/* 2. Search & Category Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {filteredResources.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 cursor-pointer transition-colors shrink-0"
              title={isAllSelected ? 'Deselect all documents' : 'Select all documents for bulk actions'}
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
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents or legal keywords..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x sm:flex-wrap w-full md:w-auto pb-1 sm:pb-0 no-scrollbar scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
          {[{ id: 'ALL', label: 'All Documents' }, ...RESOURCE_CATEGORIES].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-[#014900] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredResources.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const catObj = RESOURCE_CATEGORIES.find((c) => c.id === item.category?.toLowerCase()) || { label: item.category || 'Official Document' };

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-[#014900] relative group ${
                isSelected ? 'border-[#014900] ring-2 ring-[#014900]/20 bg-emerald-50/10' : 'border-gray-200/90'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectOne(item.id)}
                      className="p-1 text-gray-400 hover:text-[#014900] cursor-pointer shrink-0"
                      title={isSelected ? 'Deselect document' : 'Select document for deletion'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#014900]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#014900] flex items-center justify-center font-bold shrink-0 border border-emerald-100">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-gray-200">
                        {catObj.label}
                      </span>
                      <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                        Priority Rank: #{item.display_order || 1}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 bg-gray-100 hover:bg-amber-50 text-gray-600 hover:text-amber-700 rounded-xl transition-colors cursor-pointer"
                      title="Edit Document"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeletingId(item.id)}
                      className="p-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-[#014900] group-hover:text-[#D9A000] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-3 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* File Details & Download Button */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0 text-gray-600 font-semibold text-[11px]">
                  <FileCheck className="w-4 h-4 text-[#D9A000] shrink-0" />
                  <span className="truncate">{item.file_name || 'Document.pdf'}</span>
                  <span className="text-gray-400 font-normal shrink-0">({formatBytes(item.file_size)})</span>
                </div>

                <a
                  href={resolveDocumentUrl(item.file_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] rounded-xl text-[11px] font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>

            </div>
          );
        })}
      </div>

      {/* 4. FLOATING BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-40 bg-gray-950/95 text-white backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-white/20 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#D9A000] text-[#014900] text-xs font-black">
              {selectedIds.length}
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-gray-200">
              {selectedIds.length === 1 ? '1 document selected' : `${selectedIds.length} documents selected`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-6 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#014900] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#014900] uppercase tracking-tight">
                    {editingItem ? 'Edit Document Details' : 'Upload Official Union Document'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Public Records & Constitutional Registry</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleSaveResource} className="space-y-4">
              
              {/* Document Title */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. GNUTS Supreme National Constitution (2025 Revised Edition)"
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900] focus:bg-white"
                />
              </div>

              {/* Category & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Document Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-bold outline-none focus:border-[#014900]"
                  >
                    {RESOURCE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Display Priority Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
                  />
                </div>
              </div>

              {/* Document File / Public Share Link */}
              <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-[#014900] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#014900]" />
                    <span>Document File / Direct Download Link *</span>
                  </label>
                  <span className="text-[10px] bg-[#014900] text-white px-2 py-0.5 rounded-full font-bold">REQUIRED</span>
                </div>

                <input
                  type="url"
                  required
                  placeholder="e.g. https://drive.google.com/file/d/... or https://res.cloudinary.com/... or direct PDF link"
                  value={formData.file_path}
                  onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-xs font-semibold outline-none focus:border-[#014900]"
                />

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold block">How to host & link your document:</span>
                    <span>Upload your PDF/Word doc to <strong>Google Drive</strong> (set sharing to <em>'Anyone with the link can view'</em>), <strong>Cloudinary</strong>, or <strong>Dropbox</strong>, and paste the share link here.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-600 uppercase">
                      File Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GNUTS_Constitution_2025.pdf"
                      value={formData.file_name}
                      onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs font-semibold outline-none focus:border-[#014900]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-600 uppercase">
                      Test Document Access
                    </label>
                    {formData.file_path ? (
                      <a
                        href={resolveDocumentUrl(formData.file_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Test & Open Link</span>
                      </a>
                    ) : (
                      <div className="px-3 py-2 bg-gray-100 text-gray-400 rounded-xl text-xs font-medium text-center">
                        Enter link above to test
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Executive Summary & Scope *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide brief background context, effective dates, passing congress resolution, and legal relevance..."
                  className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900] focus:bg-white leading-relaxed"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-[#014900] hover:bg-[#003300] text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-xl transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? 'Saving...' : (editingItem ? 'Update Document' : 'Upload Document')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 6. INDIVIDUAL DELETE CONFIRMATION MODAL */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-gray-900">Delete this Document?</h4>
            <p className="text-xs text-gray-600 font-medium">
              This official document will be permanently removed from the public registry.
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
                onClick={() => handleDeleteResource(isDeletingId)}
                className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. BULK DELETE CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-gray-900 uppercase">
                  Bulk Remove Documents
                </h4>
                <span className="text-xs font-bold text-rose-600">
                  {selectedIds.length} document(s) selected
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-900">{selectedIds.length} selected documents</strong>? This action cannot be undone.
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
                onClick={handleBulkDeleteResources}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Removing...' : `Delete ${selectedIds.length} Documents`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
