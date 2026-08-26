'use client';

import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  ExternalLink, 
  FileCheck, 
  ShieldCheck, 
  Scale, 
  BookOpen, 
  Layers 
} from 'lucide-react';
import { resolveDocumentUrl } from '@/lib/imageUtils';

export interface ResourceItem {
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

const CATEGORIES = [
  { id: 'ALL', label: 'All Resources' },
  { id: 'constitution', label: 'Constitution & Bylaws' },
  { id: 'communique', label: 'NEC Communiqués' },
  { id: 'financial', label: 'Financial Audits' },
  { id: 'policy', label: 'Policy Resolutions' },
  { id: 'academic', label: 'TVET Guides' },
];

export default function ResourcesPageClient({
  initialResources = [],
}: {
  initialResources: ResourceItem[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '2.1 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredResources = initialResources.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.file_name || '').toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === 'ALL' ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10">
      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search constitution, communiqués, policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:border-[#014900] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#014900] text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-bold px-2">
        <span>SHOWING {filteredResources.length} OFFICIAL {filteredResources.length === 1 ? 'RECORD' : 'RECORDS'}</span>
        {selectedCategory !== 'ALL' && (
          <span className="text-[#014900] uppercase">Category: {selectedCategory}</span>
        )}
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl">
            📜
          </div>
          <h4 className="text-lg font-black text-gray-900">No Documents Found</h4>
          <p className="text-xs text-gray-500 font-medium">
            {searchQuery
              ? `No resources matching "${searchQuery}". Try a different search term.`
              : 'No documents in this category yet. Check back soon.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res, idx) => {
            const fileExt = (res.file_name || 'pdf').split('.').pop()?.toUpperCase() || 'PDF';
            const isGoldAccent = idx % 2 === 1;

            return (
              <div
                key={res.id || idx}
                className={`bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group ${
                  isGoldAccent ? 'border-l-4 border-l-[#D9A000]' : 'border-l-4 border-l-[#014900]'
                }`}
              >
                <div className="space-y-4">
                  {/* Category Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border transition-colors ${
                        isGoldAccent
                          ? 'bg-[#D9A000]/15 text-[#D9A000] border-[#D9A000]/30 group-hover:bg-[#014900] group-hover:text-white'
                          : 'bg-[#014900]/10 text-[#014900] border-[#014900]/20 group-hover:bg-[#D9A000] group-hover:text-white'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <span
                      className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                        isGoldAccent ? 'bg-[#D9A000] text-white' : 'bg-[#014900] text-white'
                      }`}
                    >
                      {res.category || 'DOCUMENT'}
                    </span>
                  </div>

                  <h3
                    className={`text-base sm:text-lg font-black leading-snug transition-colors ${
                      isGoldAccent ? 'text-gray-900 group-hover:text-[#D9A000]' : 'text-gray-900 group-hover:text-[#014900]'
                    }`}
                  >
                    {res.title}
                  </h3>

                  <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-3">
                    {res.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                    <span>📄 {fileExt} FORMAT</span>
                    <span>💾 {formatBytes(res.file_size)}</span>
                  </div>

                  <a
                    href={resolveDocumentUrl(res.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 px-4 text-xs font-black rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer ${
                      isGoldAccent
                        ? 'bg-[#D9A000] hover:bg-[#014900] text-white'
                        : 'bg-[#014900] hover:bg-[#D9A000] text-white'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official Document</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
