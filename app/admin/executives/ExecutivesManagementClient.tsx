'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Users, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Mail, 
  Phone, 
  X, 
  AlertCircle,
  LayoutGrid,
  List,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  Crop,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckSquare,
  Square
} from 'lucide-react';
import DirectImageUploader from '@/components/DirectImageUploader';
import ImageCropperModal from '@/components/ImageCropperModal';

interface ExecutiveItem {
  id: number;
  full_name: string;
  position: string;
  email: string;
  phone: string;
  bio?: string;
  photo?: string;
  display_order?: number;
}

const DEFAULT_EXECUTIVES_SEED: ExecutiveItem[] = [];

const STANDARD_PORTFOLIOS = [
  'National President',
  'Vice President',
  'General Secretary',
  'Coordinating Secretary',
  'Financial Secretary / National Treasurer',
  'Women\'s Commissioner',
  'Programs & Projects Officer',
  'Press & Information Secretary',
  'Director of TVET & Innovation',
  'National Organizer',
];

export default function ExecutivesManagementClient({ 
  initialExecutives = [] 
}: { 
  initialExecutives?: ExecutiveItem[] 
}) {
  const [executivesList, setExecutivesList] = useState<ExecutiveItem[]>(initialExecutives);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExecutiveItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Cropper State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState('');
  const cropFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelectForCrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFeedbackMsg('Please select a valid image file (JPEG, PNG, WebP) to crop.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCropperSrc(event.target.result as string);
        setCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    position: 'National President',
    email: '',
    phone: '',
    bio: '',
    photo: '',
    display_order: 1,
  });

  // Filtered List
  const filteredExecutives = executivesList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.full_name.toLowerCase().includes(q) ||
      item.position.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q)
    );
  });

  // Selection handlers
  const isAllSelected = filteredExecutives.length > 0 && filteredExecutives.every((it) => selectedIds.includes(it.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredExecutives.map((it) => it.id));
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
      full_name: '',
      position: '',
      email: '',
      phone: '',
      bio: '',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
      display_order: executivesList.length + 1,
    });
    setFeedbackMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ExecutiveItem) => {
    setEditingItem(item);
    setFormData({
      full_name: item.full_name,
      position: item.position,
      email: item.email,
      phone: item.phone,
      bio: item.bio || '',
      photo: item.photo || '',
      display_order: item.display_order || 1,
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
        const res = await fetch(`/api/admin/executives/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setExecutivesList((prev) =>
            prev.map((item) =>
              item.id === editingItem.id ? { ...item, ...formData } : item
            )
          );
          setIsModalOpen(false);
        } else {
          setFeedbackMsg('Failed to update executive');
        }
      } else {
        // Create Mode
        const res = await fetch('/api/admin/executives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok && data.executive) {
          setExecutivesList([...executivesList, data.executive]);
          setIsModalOpen(false);
        } else {
          setFeedbackMsg('Failed to add executive officer');
        }
      }
    } catch {
      setFeedbackMsg('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExecutive = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/executives/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExecutivesList((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((it) => it !== id));
        setIsDeletingId(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete executive officer');
      }
    } catch {
      alert('Failed to delete executive officer');
    }
  };

  const handleBulkDeleteExecutives = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/executives', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        setExecutivesList((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
      } else {
        alert('Failed to bulk delete selected officers');
      }
    } catch {
      alert('Network error during bulk delete');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-['Montserrat',sans-serif] pb-20">
      
      {/* 1. Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#014900] tracking-tight">
            Executive Leadership Suite
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">
            National Executive Council (NEC) roster, leadership hierarchies, and official contact profiles ({executivesList.length} officers)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Executive Officer</span>
        </button>
      </div>

      {/* 2. Search & View Mode Switcher */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {filteredExecutives.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 cursor-pointer transition-colors shrink-0"
              title={isAllSelected ? 'Deselect all officers' : 'Select all officers for bulk actions'}
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
              placeholder="Search by officer name, portfolio, email..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
            />
          </div>
        </div>

        {/* Grid / Table Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#014900] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#014900] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Officer Cards Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredExecutives.map((exec) => {
            const isSelected = selectedIds.includes(exec.id);
            const photoSrc = exec.photo 
              ? (exec.photo.startsWith('http') || exec.photo.startsWith('/') ? exec.photo : `/${exec.photo}`)
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop';

            return (
              <div
                key={exec.id}
                className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between group relative shadow-md hover:shadow-xl ${
                  isSelected ? 'border-[#014900] ring-2 ring-[#014900]/20 bg-emerald-50/10' : 'border-gray-200/90'
                }`}
              >
                {/* Select Checkbox & Rank Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSelectOne(exec.id);
                    }}
                    className="p-1.5 rounded-xl bg-black/60 backdrop-blur-xs text-white hover:bg-black/80 transition-colors cursor-pointer border border-white/20"
                    title={isSelected ? 'Deselect officer' : 'Select officer for deletion'}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#D9A000]" />
                    ) : (
                      <Square className="w-4 h-4 text-white/80" />
                    )}
                  </button>

                  <span className="px-2.5 py-1 bg-black/70 backdrop-blur-xs text-[#D9A000] text-[10px] font-black uppercase rounded-full shadow-md">
                    Rank #{exec.display_order || 1}
                  </span>
                </div>

                {/* Top Action Quick Buttons */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(exec)}
                    className="p-1.5 bg-white/90 hover:bg-[#014900] text-gray-700 hover:text-white rounded-xl shadow-md transition-colors cursor-pointer"
                    title="Edit Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeletingId(exec.id)}
                    className="p-1.5 bg-white/90 hover:bg-red-600 text-gray-700 hover:text-white rounded-xl shadow-md transition-colors cursor-pointer"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Portrait Photo */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-900">
                  <img
                    src={photoSrc}
                    alt={exec.full_name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Officer Details */}
                <div className="p-5 text-center flex flex-col justify-between flex-grow space-y-3 bg-white">
                  <div>
                    <h3 className="text-base font-black text-[#014900] group-hover:text-[#D9A000] transition-colors leading-snug line-clamp-1">
                      {exec.full_name}
                    </h3>
                    <p className="text-[11px] font-black text-[#D9A000] uppercase tracking-wider mt-1 line-clamp-1">
                      {exec.position}
                    </p>
                    {exec.bio && (
                      <p className="text-[11px] text-gray-500 font-medium line-clamp-2 mt-2 leading-relaxed">
                        {exec.bio}
                      </p>
                    )}
                  </div>

                  {/* Contact Info Footer */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-4 text-xs">
                    {exec.email && (
                      <a
                        href={`mailto:${exec.email}`}
                        className="text-gray-500 hover:text-[#014900] font-bold flex items-center gap-1 transition-colors"
                        title={exec.email}
                      >
                        <Mail className="w-3.5 h-3.5 text-[#014900]" />
                        <span className="text-[10px] truncate max-w-[100px]">Email</span>
                      </a>
                    )}
                    {exec.phone && (
                      <a
                        href={`tel:${exec.phone}`}
                        className="text-gray-500 hover:text-[#014900] font-bold flex items-center gap-1 transition-colors"
                        title={exec.phone}
                      >
                        <Phone className="w-3.5 h-3.5 text-[#014900]" />
                        <span className="text-[10px]">Call</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-5 w-12 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="p-1 hover:text-[#014900] cursor-pointer"
                      title={isAllSelected ? 'Deselect all' : 'Select all'}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#014900]" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-5">Order</th>
                  <th className="py-4 px-5">Portrait</th>
                  <th className="py-4 px-5">Full Name</th>
                  <th className="py-4 px-5">Portfolio / Designation</th>
                  <th className="py-4 px-5 hidden md:table-cell">Contact Email</th>
                  <th className="py-4 px-5 hidden sm:table-cell">Phone</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExecutives.map((exec) => {
                  const isSelected = selectedIds.includes(exec.id);
                  return (
                    <tr 
                      key={exec.id} 
                      className={`transition-colors group ${
                        isSelected ? 'bg-emerald-50/30' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-3 px-5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectOne(exec.id)}
                          className="p-1 text-gray-400 hover:text-[#014900] cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#014900]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-5 font-black text-gray-500">
                        #{exec.display_order || 1}
                      </td>
                      <td className="py-3 px-5">
                        <div className="w-12 h-14 rounded-xl bg-gray-900 overflow-hidden shrink-0 border border-gray-200">
                          <img
                            src={exec.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop'}
                            alt={exec.full_name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-5 font-black text-gray-900 group-hover:text-[#014900]">
                        {exec.full_name}
                      </td>
                      <td className="py-3 px-5 font-black text-[#D9A000] uppercase tracking-wider">
                        {exec.position}
                      </td>
                      <td className="py-3 px-5 text-gray-600 font-medium hidden md:table-cell">
                        {exec.email}
                      </td>
                      <td className="py-3 px-5 text-gray-600 font-medium hidden sm:table-cell">
                        {exec.phone}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(exec)}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-amber-50 text-gray-600 hover:text-amber-700 transition-colors cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDeletingId(exec.id)}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
              {selectedIds.length === 1 ? '1 officer selected' : `${selectedIds.length} officers selected`}
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

      {/* 5. Create / Edit Executive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-6 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#014900] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#014900] uppercase tracking-tight">
                    {editingItem ? 'Edit Executive Officer' : 'Add Executive Officer'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">National Executive Council Administration</p>
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
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Full Name & Titles *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. H.E. Isaac Mensah"
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900] focus:bg-white"
                />
              </div>

              {/* Portfolio & Rank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Executive Portfolio / Position *
                  </label>
                  <input
                    type="text"
                    required
                    list="portfolio-suggestions"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. National President, PRO, General Secretary..."
                    className="w-full px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-bold outline-none focus:border-[#014900] focus:bg-white transition-colors"
                  />
                  <datalist id="portfolio-suggestions">
                    {STANDARD_PORTFOLIOS.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Hierarchy Rank (Display Order) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="president@gnuts.org.gh"
                    className="w-full px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Direct Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+233 24 123 4567"
                    className="w-full px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
                  />
                </div>
              </div>

              {/* Officer Official Portrait Photo */}
              <div className="space-y-2 p-4 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-800">
                    Officer Portrait Photo *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={cropFileInputRef}
                      onChange={handleFileSelectForCrop}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => cropFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                      title="Upload local image and crop/resize to portrait"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>Upload & Crop Photo</span>
                    </button>
                  </div>
                </div>

                <DirectImageUploader
                  label=""
                  value={formData.photo}
                  onChange={(url) => setFormData({ ...formData, photo: url })}
                  helperText="Recommended aspect ratio 4:5 portrait. Click 'Upload & Crop Photo' above to resize."
                />
              </div>

              {/* Bio & Leadership Focus */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Officer Bio & Policy Focus (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Provide a brief summary of leadership objectives, academic background, or committee assignments..."
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900] focus:bg-white leading-relaxed"
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
                  {isSaving ? 'Saving Profile...' : (editingItem ? 'Update Officer' : 'Save Officer')}
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
            <h4 className="text-base font-black text-gray-900">Remove Officer Profile?</h4>
            <p className="text-xs text-gray-600 font-medium">
              This officer will be removed from the National Executive Council roster and the public website.
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
                onClick={() => handleDeleteExecutive(isDeletingId)}
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
                  Bulk Remove Officers
                </h4>
                <span className="text-xs font-bold text-rose-600">
                  {selectedIds.length} officer(s) selected
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-gray-900">{selectedIds.length} selected executive officers</strong>? This action cannot be undone.
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
                onClick={handleBulkDeleteExecutives}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Removing...' : `Remove ${selectedIds.length} Officers`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Image Cropping & Resizing Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={cropperSrc}
        title={`Crop & Resize Portrait: ${formData.full_name || 'Executive Officer'}`}
        defaultAspectRatio={4 / 5}
        onCropComplete={(croppedUrl) => {
          setFormData((prev) => ({ ...prev, photo: croppedUrl }));
          setFeedbackMsg('');
        }}
      />

    </div>
  );
}
