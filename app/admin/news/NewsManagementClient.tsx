'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Newspaper, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Eye, 
  X, 
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Share2,
  Calendar,
  CheckSquare,
  Square
} from 'lucide-react';
import DirectImageUploader from '@/components/DirectImageUploader';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  author?: string;
  published_at?: any;
  status?: string;
  view_count?: number;
  allow_sharing?: number | boolean;
  image2?: string;
  image3?: string;
}

export default function NewsManagementClient({ initialNews = [] }: { initialNews?: NewsItem[] }) {
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNews);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: 'GNUTS Secretariat',
    published_at: new Date().toISOString().substring(0, 10),
    status: 'published',
    image: '',
    image2: '',
    image3: '',
    allow_sharing: true,
  });

  // Filtered List
  const filteredNews = newsList.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status?.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const totalPublished = newsList.filter((n) => (n.status || 'published').toLowerCase() === 'published').length;
  const totalDrafts = newsList.filter((n) => n.status?.toLowerCase() === 'draft').length;

  // Selection handlers
  const isAllSelected = filteredNews.length > 0 && filteredNews.every((it) => selectedIds.includes(it.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNews.map((it) => it.id));
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
      content: '',
      author: 'GNUTS Secretariat',
      published_at: new Date().toISOString().substring(0, 10),
      status: 'published',
      image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056250/gnuts_cc_tech-GUEST_jt8cge.png',
      image2: '',
      image3: '',
      allow_sharing: true,
    });
    setFeedbackMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      author: item.author || 'GNUTS Secretariat',
      published_at: item.published_at ? String(item.published_at).substring(0, 10) : new Date().toISOString().substring(0, 10),
      status: item.status || 'published',
      image: item.image || '',
      image2: item.image2 || '',
      image3: item.image3 || '',
      allow_sharing: item.allow_sharing !== undefined ? Boolean(item.allow_sharing) : true,
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
        const res = await fetch(`/api/admin/news/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setNewsList((prev) =>
            prev.map((item) =>
              item.id === editingItem.id ? { ...item, ...formData } : item
            )
          );
          setIsModalOpen(false);
        } else {
          setFeedbackMsg('Failed to update article');
        }
      } else {
        // Create Mode
        const res = await fetch('/api/admin/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok && data.article) {
          setNewsList([data.article, ...newsList]);
          setIsModalOpen(false);
        } else {
          setFeedbackMsg('Failed to publish article');
        }
      }
    } catch {
      setFeedbackMsg('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNewsList((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((it) => it !== id));
        setIsDeletingId(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete article');
      }
    } catch {
      alert('Failed to delete article');
    }
  };

  const handleBulkDeleteArticles = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        setNewsList((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
      } else {
        alert('Failed to bulk delete selected articles');
      }
    } catch {
      alert('Network error during bulk delete');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (item: NewsItem) => {
    const newStatus = (item.status || 'published').toLowerCase() === 'published' ? 'draft' : 'published';
    try {
      await fetch(`/api/admin/news/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: newStatus }),
      });
      setNewsList((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, status: newStatus } : n))
      );
    } catch {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 font-['Montserrat',sans-serif] pb-20">
      
      {/* 1. Header with Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#014900] tracking-tight">
            News & Press Releases
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">
            Manage official union announcements, press communiqués, and national activities ({newsList.length} articles)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-5 py-3 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Release</span>
        </button>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#014900] flex items-center justify-center font-bold">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-gray-900 leading-none">{newsList.length}</span>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Articles</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-gray-900 leading-none">{totalPublished}</span>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Published</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-gray-900 leading-none">{totalDrafts}</span>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Drafts</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-gray-900 leading-none">
              {newsList.reduce((acc, curr) => acc + (curr.view_count || 0), 0)}
            </span>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Reads</p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {filteredNews.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 cursor-pointer transition-colors shrink-0"
              title={isAllSelected ? 'Deselect all articles' : 'Select all articles for bulk actions'}
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
              placeholder="Search news by title or author..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar scrollbar-none">
          {['ALL', 'PUBLISHED', 'DRAFT'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#014900] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. News Table List */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-black uppercase tracking-wider text-gray-500">
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
                <th className="py-4 px-5">Image</th>
                <th className="py-4 px-5">Title & Context</th>
                <th className="py-4 px-5 hidden md:table-cell">Author</th>
                <th className="py-4 px-5 hidden sm:table-cell">Date</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredNews.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isPub = (item.status || 'published').toLowerCase() === 'published';
                return (
                  <tr 
                    key={item.id} 
                    className={`transition-colors group ${
                      isSelected ? 'bg-emerald-50/30' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    {/* Checkbox Column */}
                    <td className="py-3 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectOne(item.id)}
                        className="p-1 text-gray-400 hover:text-[#014900] cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#014900]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Thumbnail Image */}
                    <td className="py-3 px-5">
                      <div className="w-14 h-14 rounded-2xl bg-gray-900 overflow-hidden border border-gray-200 shrink-0">
                        {item.image ? (
                          <img
                            src={item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/${item.image}`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title & Preview */}
                    <td className="py-3 px-5 max-w-sm">
                      <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-[#014900] transition-colors leading-snug line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-gray-500 font-medium text-[11px] line-clamp-1 mt-0.5">
                        {item.content}
                      </p>
                    </td>

                    {/* Author */}
                    <td className="py-3 px-5 font-bold text-gray-600 hidden md:table-cell">
                      {item.author || 'Secretariat'}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-5 font-medium text-gray-500 hidden sm:table-cell whitespace-nowrap">
                      {item.published_at ? String(item.published_at).substring(0, 10) : 'Recent'}
                    </td>

                    {/* Status Badge Toggle */}
                    <td className="py-3 px-5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isPub
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {isPub ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{item.status || 'Published'}</span>
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Live View */}
                        <Link
                          href={`/blog/${item.id}`}
                          target="_blank"
                          className="p-2 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-[#014900] transition-colors"
                          title="View on Public Site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 rounded-xl bg-gray-100 hover:bg-amber-50 text-gray-600 hover:text-amber-700 transition-colors cursor-pointer"
                          title="Edit Article"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setIsDeletingId(item.id)}
                          className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredNews.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-medium">
                    <Newspaper className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    No press releases found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. FLOATING BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-40 bg-gray-950/95 text-white backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-white/20 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#D9A000] text-[#014900] text-xs font-black">
              {selectedIds.length}
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-gray-200">
              {selectedIds.length === 1 ? '1 release selected' : `${selectedIds.length} releases selected`}
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

      {/* 6. CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs font-['Montserrat',sans-serif] overflow-hidden">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[86vh] shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fadeIn">
            
            {/* Fixed Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase text-[#014900] tracking-tight">
                  {editingItem ? 'Edit Press Release' : 'Publish New Announcement'}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Create an official news item visible to technical students across Ghana.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {feedbackMsg && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              <form id="news-upload-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Headline Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 34th National Delegates Congress Date Announced"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900] focus:bg-white"
                  />
                </div>

                {/* Author & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                      Author / Desk *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="e.g. GNUTS PRO / General Secretary"
                      className="w-full px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                      Publication Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.published_at}
                      onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
                    />
                  </div>
                </div>

                {/* Main Event Flyer / Cover Photo */}
                <DirectImageUploader
                  label="Main Event Flyer / Cover Photo"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  helperText="Upload official event poster, flyer, or photo"
                />

                {/* In-Article Additional Photos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DirectImageUploader
                    label="In-Article Photo 2 (Optional)"
                    value={formData.image2}
                    onChange={(url) => setFormData({ ...formData, image2: url })}
                    helperText="Secondary photo inside article body"
                  />
                  <DirectImageUploader
                    label="In-Article Photo 3 (Optional)"
                    value={formData.image3}
                    onChange={(url) => setFormData({ ...formData, image3: url })}
                    helperText="Additional photo inside article body"
                  />
                </div>

                {/* Article Content */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                      Full Article Content *
                    </label>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {formData.content.length} characters
                    </span>
                  </div>
                  <textarea
                    required
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter the full article body, statements, bullet points, and official communique..."
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900] focus:bg-white leading-relaxed"
                  />
                </div>

                {/* Social Sharing Switch */}
                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#014900]" />
                    <span className="text-xs font-bold text-gray-700">Allow WhatsApp & Social Sharing</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.allow_sharing}
                    onChange={(e) => setFormData({ ...formData, allow_sharing: e.target.checked })}
                    className="w-4 h-4 accent-[#014900] cursor-pointer"
                  />
                </div>
              </form>
            </div>

            {/* Fixed Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-black text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="news-upload-form"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-2xl bg-[#014900] hover:bg-[#003300] text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-xl transition-all cursor-pointer disabled:opacity-70 flex items-center gap-2"
              >
                {isSaving ? 'Saving Article...' : (editingItem ? 'Update Release' : 'Publish Article')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. INDIVIDUAL DELETE CONFIRMATION MODAL */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-gray-900">Delete this Press Release?</h4>
            <p className="text-xs text-gray-600 font-medium">
              This action cannot be undone. The article will be permanently removed from the public website.
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
                onClick={() => handleDeleteArticle(isDeletingId)}
                className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. BULK DELETE CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-gray-900 uppercase">
                  Bulk Delete Press Releases
                </h4>
                <span className="text-xs font-bold text-rose-600">
                  {selectedIds.length} release(s) selected
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-900">{selectedIds.length} selected press releases</strong>? This action will remove them completely and cannot be undone.
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
                onClick={handleBulkDeleteArticles}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Deleting...' : `Delete ${selectedIds.length} Articles`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
