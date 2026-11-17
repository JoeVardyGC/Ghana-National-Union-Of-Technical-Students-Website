'use client';

import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { resolveDocumentUrl } from '@/lib/imageUtils';

export interface Resource {
  id?: number;
  title: string;
  category?: string;
  description?: string;
  file_name?: string;
  file_size?: number;
  created_at?: string;
  file_path?: string;
}

const DEFAULT_RESOURCES: Resource[] = [];

interface ResourcesSectionProps {
  initialResources?: Resource[];
  dbResources?: Resource[];
}

export default function ResourcesSection({ initialResources, dbResources }: ResourcesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const rawList = (dbResources && dbResources.length > 0)
    ? dbResources
    : ((initialResources && initialResources.length > 0) ? initialResources : DEFAULT_RESOURCES);

  const filteredResources = selectedCategory === 'ALL'
    ? rawList
    : rawList.filter((r) => (r.category || '').toUpperCase() === selectedCategory.toUpperCase());

  return (
    <section id="resources" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#16201A]">
            Resources & Supreme Constitution
          </h2>
          <p className="text-gray-600 text-sm sm:text-base font-medium">
            Official union constitution, central committee resolutions, and policy frameworks.
          </p>
        </div>

        {rawList.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['ALL', 'CONSTITUTION', 'POLICY BRIEF', 'GUIDELINES'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#014900] text-white shadow-lg scale-105'
                    : 'bg-[#FAF9F6] text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Empty State Card */}
        {filteredResources.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-xl border border-gray-200 shadow-sm max-w-xl mx-auto">
            <p className="text-gray-500 font-medium text-sm">
              {selectedCategory !== 'ALL'
                ? `No documents found under category "${selectedCategory}".`
                : 'No official constitution or policy documents uploaded yet. Check back soon.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredResources.map((res, idx) => {
              const fileExt = (res.file_name || 'pdf').split('.').pop()?.toUpperCase() || 'PDF';
              const fileSizeKb = Math.round((res.file_size || 2048000) / 1024);
              const fileSizeMb = (fileSizeKb / 1024).toFixed(1);
              const isGoldAccent = idx % 2 === 1;

              return (
                <div
                  key={res.id || idx}
                  className="bg-white p-7 sm:p-8 rounded-xl border border-[#E4E2DA] hover:border-[#C9C6BA] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border transition-all duration-300 ${
                        isGoldAccent
                          ? 'bg-[#D9A000]/15 text-gold-ink border-[#D9A000]/40 group-hover:bg-[#014900] group-hover:text-white group-hover:border-[#014900]'
                          : 'bg-[#014900]/10 text-[#014900] border-[#014900]/20 group-hover:bg-[#D9A000] group-hover:text-[#014900] group-hover:border-[#D9A000]'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${
                        isGoldAccent
                          ? 'bg-[#D9A000] text-[#014900] group-hover:bg-[#014900] group-hover:text-white'
                          : 'bg-[#014900] text-white group-hover:bg-[#D9A000] group-hover:text-[#014900]'
                      }`}>
                        {res.category || 'DOCUMENT'}
                      </span>
                    </div>

                    <h4 className={`text-lg sm:text-xl font-semibold leading-snug transition-colors duration-300 pt-1 ${
                      isGoldAccent
                        ? 'text-gold-ink group-hover:text-[#014900]'
                        : 'text-[#014900] group-hover:text-gold-ink'
                    }`}>
                      {res.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-100 space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
                      <span>{fileExt} FORMAT</span>
                      <span>{fileSizeMb} MB</span>
                    </div>

                    <a
                      href={resolveDocumentUrl(res.file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3 px-4 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 shadow-md flex items-center justify-center gap-2 tracking-wider uppercase group-hover:shadow-md cursor-pointer ${
                        isGoldAccent
                          ? 'bg-[#D9A000] text-[#014900] hover:bg-[#014900] hover:text-white group-hover:bg-[#014900] group-hover:text-white'
                          : 'bg-[#014900] text-white hover:bg-[#D9A000] hover:text-[#014900] group-hover:bg-[#D9A000] group-hover:text-[#014900]'
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
    </section>
  );
}
