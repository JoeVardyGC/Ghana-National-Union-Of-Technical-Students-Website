'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Lightbulb, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  X, 
  AlertCircle,
  Video,
  ThumbsUp,
  Building2,
  User,
  Sparkles,
  Tag,
  CheckSquare,
  Square
} from 'lucide-react';
import DirectImageUploader from '@/components/DirectImageUploader';

interface InnovationItem {
  id: number;
  title: string;
  description: string;
  project_image?: string;
  video_url?: string;
  institution?: string;
  student_name?: string;
  category?: string;
  upvotes?: number;
  status: string;
  created_at?: string;
}

const DEFAULT_INNOVATIONS_SEED: InnovationItem[] = [];

const GHANA_TECHNICAL_UNIVERSITIES = [
  'Accra Technical University (ATU)',
  'Kumasi Technical University (KsTU)',
  'Takoradi Technical University (TTU)',
  'Cape Coast Technical University (CCTU)',
  'Koforidua Technical University (KTU)',
  'Ho Technical University (HTU)',
  'Sunyani Technical University (STU)',
  'Tamale Technical University (TaTU)',
  'Bolgatanga Technical University (BTU)',
  'Wa Technical University (WTU)',
  'Dabokpa Technical Institute',
  'National Vocational Training Institute (NVTI)',
];

const INNOVATION_CATEGORIES = [
  'Robotics & AI',
  'Renewable Energy',
  'Agrotechnology',
  'Biomedical Engineering',
  'Automotive & Fabrication',
  'Software & IoT',
  'Civil & Structural TVET',
  'Electrical & Electronics',
];

export default function InnovationsManagementClient({
  initialInnovations = []
}: {
  initialInnovations?: InnovationItem[];
}) {
  const [innovationsList, setInnovationsList] = useState<InnovationItem[]>(
    initialInnovations.length > 0 ? initialInnovations : DEFAULT_INNOVATIONS_SEED
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InnovationItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_image: '',
    video_url: '',
    institution: '',
    student_name: '',
    category: 'Robotics & AI',
    status: 'approved',
  });

  // Filtered List
  const filteredInnovations = innovationsList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      (item.student_name && item.student_name.toLowerCase().includes(q)) ||
      (item.institution && item.institution.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' || item.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const pendingCount = innovationsList.filter((i) => i.status.toLowerCase() === 'pending').length;

  // Selection handlers
  const isAllSelected = filteredInnovations.length > 0 && filteredInnovations.every((it) => selectedIds.includes(it.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInnovations.map((it) => it.id));
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
      project_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop',
      video_url: '',
      institution: GHANA_TECHNICAL_UNIVERSITIES[0],
      student_name: '',
      category: 'Robotics & AI',
      status: 'approved',
    });
    setFeedbackMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: InnovationItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      project_image: item.project_image || '',
      video_url: item.video_url || '',
      institution: item.institution || '',
      student_name: item.student_name || '',
      category: item.category || 'Robotics & AI',
      status: item.status || 'approved',
    });
    setFeedbackMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg('');

    try {
      if (editingItem) {
        // Edit Mode
        const res = await fetch(`/api/admin/innovations/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setInnovationsList((prev) =>
            prev.map((item) =>
              item.id === editingItem.id ? { ...item, ...formData } : item
            )
          );
          setIsModalOpen(false);
        } else {
          setFeedbackMsg('Failed to update project');
        }
      } else {
        // Create Mode
        const res = await fetch('/api/admin/innovations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok && data.innovation) {
          setInnovationsList([data.innovation, ...innovationsList]);
          setIsModalOpen(false);
        } else {
          setFeedbackMsg('Failed to publish project');
        }
      }
    } catch {
      setFeedbackMsg('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (item: InnovationItem, newStatus: string) => {
    try {
      await fetch(`/api/admin/innovations/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: newStatus }),
      });
      setInnovationsList((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
      );
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDeleteInnovation = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/innovations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInnovationsList((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((it) => it !== id));
        setIsDeletingId(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete innovation project');
      }
    } catch {
      alert('Failed to delete innovation project');
    }
  };

  const handleBulkDeleteInnovations = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/innovations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        setInnovationsList((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
      } else {
        alert('Failed to bulk delete selected projects');
      }
    } catch {
      alert('Network error during bulk delete');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-['Montserrat',sans-serif] pb-20">
      
      {/* 1. Header with Title & Submit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#014900] tracking-tight">
            TVET Innovations & Student Projects
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">
            Review student technology prototypes, approve exhibition entries, and showcase TVET solutions ({innovationsList.length} total)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit New TVET Project</span>
        </button>
      </div>

      {/* 2. Search & Status Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {filteredInnovations.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 cursor-pointer transition-colors shrink-0"
              title={isAllSelected ? 'Deselect all projects' : 'Select all projects for bulk actions'}
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
              placeholder="Search projects, innovator, or institution..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
            />
          </div>
        </div>

        {/* Status Tabs with Notification Pill */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar scrollbar-none pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Projects' },
            { id: 'PENDING', label: `Pending Review ${pendingCount > 0 ? `(${pendingCount})` : ''}` },
            { id: 'APPROVED', label: 'Approved Live' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#014900] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Innovations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInnovations.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const st = item.status.toLowerCase();
          const isApproved = st === 'approved';
          const isPending = st === 'pending';
          const isRejected = st === 'rejected';

          const photoSrc = item.project_image
            ? (item.project_image.startsWith('http') || item.project_image.startsWith('/') ? item.project_image : `/${item.project_image}`)
            : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'border-[#014900] ring-2 ring-[#014900]/20 bg-emerald-50/10'
                  : isPending
                  ? 'border-amber-400/90 ring-2 ring-amber-400/20'
                  : 'border-gray-200/90'
              }`}
            >
              {/* Photo & Top Category / Status Badges */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-900">
                <img
                  src={photoSrc}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Checkbox & Top Category Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSelectOne(item.id);
                    }}
                    className="p-1.5 rounded-xl bg-black/60 backdrop-blur-xs text-white hover:bg-black/80 transition-colors cursor-pointer border border-white/20"
                    title={isSelected ? 'Deselect project' : 'Select project for deletion'}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#D9A000]" />
                    ) : (
                      <Square className="w-4 h-4 text-white/80" />
                    )}
                  </button>

                  <div className="px-2.5 py-1 bg-black/70 backdrop-blur-xs text-[#D9A000] text-[10px] font-black uppercase rounded-full shadow-md flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#D9A000]" />
                    <span>{item.category || 'TVET Engineering'}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 ${
                      isApproved
                        ? 'bg-emerald-600 text-white'
                        : isPending
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {isApproved && <CheckCircle2 className="w-3 h-3" />}
                    {isPending && <Clock className="w-3 h-3" />}
                    {isRejected && <XCircle className="w-3 h-3" />}
                    <span>{item.status}</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-black text-gray-900 group-hover:text-[#014900] transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Innovator & Institution Meta */}
                <div className="space-y-1.5 pt-3 border-t border-gray-100 text-xs">
                  {item.student_name && (
                    <div className="flex items-center gap-2 text-gray-700 font-bold">
                      <User className="w-3.5 h-3.5 text-[#014900] shrink-0" />
                      <span className="truncate">{item.student_name}</span>
                    </div>
                  )}
                  {item.institution && (
                    <div className="flex items-center gap-2 text-gray-500 font-medium text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{item.institution}</span>
                    </div>
                  )}
                </div>

                {/* Status Quick Actions & Modal Triggers */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1">
                    {!isApproved && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item, 'approved')}
                        className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                        title="Approve for public live site"
                      >
                        Approve
                      </button>
                    )}
                    {!isRejected && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item, 'rejected')}
                        className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                        title="Reject submission"
                      >
                        Reject
                      </button>
                    )}
                  </div>

                  {/* Edit / Delete / View */}
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/innovations/${item.id}`}
                      target="_blank"
                      className="p-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-[#014900] transition-colors"
                      title="Public Showcase Preview"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-xl bg-gray-100 hover:bg-amber-50 text-gray-600 hover:text-amber-700 transition-colors cursor-pointer"
                      title="Edit Project"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeletingId(item.id)}
                      className="p-1.5 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Project"
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

      {/* 4. FLOATING BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-40 bg-gray-950/95 text-white backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-white/20 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#D9A000] text-[#014900] text-xs font-black">
              {selectedIds.length}
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-gray-200">
              {selectedIds.length === 1 ? '1 project selected' : `${selectedIds.length} projects selected`}
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
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#014900] uppercase tracking-tight">
                    {editingItem ? 'Edit TVET Project' : 'Submit New TVET Project'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Student Technology & Engineering Showcase</p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Project Title */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Automated Solar-Powered Drip Irrigation System"
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900] focus:bg-white"
                />
              </div>

              {/* Student Innovator & Institution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Innovator / Student Team *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    placeholder="e.g. Kwame Mensah & Robotics Club"
                    className="w-full px-3.5 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#014900] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Technical University / Institution *
                  </label>
                  <input
                    type="text"
                    required
                    list="technical-institutions"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="Select or enter institution"
                    className="w-full px-3.5 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#014900] focus:bg-white"
                  />
                  <datalist id="technical-institutions">
                    {GHANA_TECHNICAL_UNIVERSITIES.map((inst) => (
                      <option key={inst} value={inst} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Category & Status & Video Link 3-col */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Discipline / Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#014900] focus:bg-white"
                  >
                    {INNOVATION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Review Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#014900] focus:bg-white"
                  >
                    <option value="approved">Approved (Live on Public Site)</option>
                    <option value="pending">Pending Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Video Demo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#014900] focus:bg-white"
                  />
                </div>
              </div>

              {/* Direct Project Photo Uploader */}
              <DirectImageUploader
                label="Project Prototype Photograph / Blueprint"
                value={formData.project_image}
                onChange={(url) => setFormData({ ...formData, project_image: url })}
                helperText="Upload high-res photo of the physical prototype, circuitry, or 3D render"
              />

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Comprehensive Project Synopsis & Problem Solved *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the technological innovation, real-world problem addressed, practical application, and test results..."
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
                  {isSaving ? 'Saving...' : (editingItem ? 'Update Project' : 'Publish Project')}
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
            <h4 className="text-base font-black text-gray-900">Remove TVET Project?</h4>
            <p className="text-xs text-gray-600 font-medium">
              This project will be permanently removed from the national innovation showcase.
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
                onClick={() => handleDeleteInnovation(isDeletingId)}
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
                  Bulk Remove Projects
                </h4>
                <span className="text-xs font-bold text-rose-600">
                  {selectedIds.length} project(s) selected
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-900">{selectedIds.length} selected innovation projects</strong>? This action cannot be undone.
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
                onClick={handleBulkDeleteInnovations}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Removing...' : `Delete ${selectedIds.length} Projects`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
