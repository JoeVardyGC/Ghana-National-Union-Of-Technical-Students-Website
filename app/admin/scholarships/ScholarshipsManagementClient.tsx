'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  X, 
  AlertCircle,
  FileCheck2,
  Sparkles,
  ArrowUpRight,
  CheckSquare,
  Square
} from 'lucide-react';

interface ScholarshipItem {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  deadline?: string;
  link?: string;
  status: string;
}

export default function ScholarshipsManagementClient({
  initialScholarships = []
}: {
  initialScholarships?: ScholarshipItem[];
}) {
  const [scholarshipsList, setScholarshipsList] = useState<ScholarshipItem[]>(initialScholarships);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScholarshipItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    deadline: '',
    link: '',
    status: 'active',
  });

  const filteredScholarships = scholarshipsList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.requirements?.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'ALL' || item.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  // Selection handlers
  const isAllSelected = filteredScholarships.length > 0 && filteredScholarships.every((it) => selectedIds.includes(it.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredScholarships.map((it) => it.id));
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
      requirements: '',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      link: 'https://scholarships.getfund.gov.gh/',
      status: 'active',
    });
    setFeedbackMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ScholarshipItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      requirements: item.requirements || '',
      deadline: item.deadline ? String(item.deadline).substring(0, 10) : '',
      link: item.link || '',
      status: item.status || 'active',
    });
    setFeedbackMsg('');
    setIsModalOpen(true);
  };

  const handleSaveScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg('');

    try {
      if (editingItem) {
        // Edit Mode
        const res = await fetch(`/api/admin/scholarships/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setScholarshipsList((prev) =>
            prev.map((item) =>
              item.id === editingItem.id ? { ...item, ...formData } : item
            )
          );
          setIsModalOpen(false);
        } else {
          setFeedbackMsg('Failed to update scholarship');
        }
      } else {
        // Create Mode
        const res = await fetch('/api/admin/scholarships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok && data.scholarship) {
          setScholarshipsList([data.scholarship, ...scholarshipsList]);
          setIsModalOpen(false);
        } else {
          setFeedbackMsg('Failed to post scholarship');
        }
      }
    } catch {
      setFeedbackMsg('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (item: ScholarshipItem) => {
    const newStatus = (item.status || 'active').toLowerCase() === 'active' ? 'closed' : 'active';
    try {
      await fetch(`/api/admin/scholarships/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: newStatus }),
      });
      setScholarshipsList((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: newStatus } : s))
      );
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDeleteScholarship = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/scholarships/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScholarshipsList((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((it) => it !== id));
        setIsDeletingId(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete scholarship');
      }
    } catch {
      alert('Failed to delete scholarship');
    }
  };

  const handleBulkDeleteScholarships = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/scholarships', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        setScholarshipsList((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
      } else {
        alert('Failed to bulk delete selected scholarships');
      }
    } catch {
      alert('Network error during bulk delete');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-['Montserrat',sans-serif] pb-20">
      
      {/* 1. Header with Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#014900] tracking-tight">
            Scholarships & Bursaries
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">
            Administer government TVET funds, institutional grants, and union financial aid ({scholarshipsList.length} total)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Scholarship</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {filteredScholarships.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 cursor-pointer transition-colors shrink-0"
              title={isAllSelected ? 'Deselect all scholarships' : 'Select all scholarships for bulk actions'}
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-[#014900]" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span className="hidden sm:inline">Select All</span>
            </button>
          )}

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholarships or requirements..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
          {['ALL', 'ACTIVE', 'CLOSED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#014900] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Scholarships Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScholarships.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isActive = (item.status || 'active').toLowerCase() === 'active';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between space-y-4 relative group ${
                isSelected ? 'border-[#014900] ring-2 ring-[#014900]/20 bg-emerald-50/10' : 'border-gray-200/90'
              }`}
            >
              {/* Card Header & Status Toggle */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectOne(item.id)}
                      className="p-1 text-gray-400 hover:text-[#014900] cursor-pointer"
                      title={isSelected ? 'Deselect scholarship' : 'Select scholarship for deletion'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#014900]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <span className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#014900] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4.5 h-4.5" />
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Status Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Click to toggle active/closed status"
                    >
                      {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{item.status || 'Active'}</span>
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 bg-gray-100 hover:bg-amber-50 text-gray-600 hover:text-amber-700 rounded-xl transition-colors cursor-pointer"
                      title="Edit Scholarship"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setIsDeletingId(item.id)}
                      className="p-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                      title="Delete Scholarship"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-black text-[#014900] group-hover:text-[#D9A000] transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              {/* Requirements Snippet */}
              {item.requirements && (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 text-[11px] text-gray-700 font-medium space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <FileCheck2 className="w-3 h-3 text-[#014900]" />
                    <span>Eligibility Requirements</span>
                  </span>
                  <p className="line-clamp-2 text-gray-600 whitespace-pre-line">
                    {item.requirements}
                  </p>
                </div>
              )}

              {/* Deadline & Portal Link Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-gray-500 font-semibold text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-[#D9A000]" />
                  <span>
                    Deadline: <strong className="text-gray-900">{item.deadline ? String(item.deadline).substring(0, 10) : 'Ongoing'}</strong>
                  </span>
                </div>

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#014900] hover:text-[#D9A000] font-black text-[11px] uppercase tracking-wider inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Portal ↗</span>
                  </a>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-200">
          <GraduationCap className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="font-bold">No scholarships found</p>
          <p className="text-xs mt-1">Try adjusting your search query or post a new scholarship.</p>
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
              {selectedIds.length === 1 ? '1 scholarship selected' : `${selectedIds.length} scholarships selected`}
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

      {/* 5. CREATE / EDIT SCHOLARSHIP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-6 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#014900] flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#014900] uppercase tracking-tight">
                    {editingItem ? 'Edit Scholarship' : 'Post New Scholarship'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">TVET Financial Aid & Bursary Programs</p>
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

            <form onSubmit={handleSaveScholarship} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Scholarship Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. GETFund TVET Tertiary Bursary Scheme 2026/2027"
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900] focus:bg-white"
                />
              </div>

              {/* Deadline & Status & Portal Link */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-bold outline-none focus:border-[#014900]"
                  >
                    <option value="active">Active (Accepting Applications)</option>
                    <option value="closed">Closed / Expired</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    External Application URL
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Full Description & Scope *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed breakdown of the scholarship package, funding amounts, coverage (tuition, accommodation, stipends)..."
                  className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900] focus:bg-white leading-relaxed"
                />
              </div>

              {/* Eligibility Requirements */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Eligibility Requirements & Required Documents
                </label>
                <textarea
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="List bullet points of who qualifies, required transcripts, admission letters, GPA minimums..."
                  className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900] focus:bg-white leading-relaxed"
                />
              </div>

              {/* Modal Footer Actions */}
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
                  {isSaving ? 'Saving...' : (editingItem ? 'Update Scholarship' : 'Post Scholarship')}
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
            <h4 className="text-base font-black text-gray-900">Remove this Scholarship?</h4>
            <p className="text-xs text-gray-600 font-medium">
              This funding opportunity will be permanently removed from the public website.
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
                onClick={() => handleDeleteScholarship(isDeletingId)}
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
                  Bulk Remove Scholarships
                </h4>
                <span className="text-xs font-bold text-rose-600">
                  {selectedIds.length} scholarship(s) selected
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-900">{selectedIds.length} selected scholarships</strong>? This action cannot be undone.
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
                onClick={handleBulkDeleteScholarships}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Removing...' : `Delete ${selectedIds.length} Scholarships`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
