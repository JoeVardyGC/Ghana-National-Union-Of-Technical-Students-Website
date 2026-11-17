'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus, Check } from 'lucide-react';

interface ImageDropzoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

export default function ImageDropzone({
  images,
  onChange,
  maxImages = 5,
  label = 'Project Pictures (Up to 5 Photos)',
}: ImageDropzoneProps) {
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} pictures allowed.`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Please select valid image files.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onChange([...images, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} pictures allowed.`);
      return;
    }

    onChange([...images, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase text-[#014900] tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-[#D9A000]" />
          <span>{label}</span>
        </label>
        <span className="text-[10px] font-black uppercase text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
          {images.length} / {maxImages} Uploaded
        </span>
      </div>

      {/* Picture Thumbnails Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group h-20 rounded-xl overflow-hidden bg-gray-200 border-2 border-[#014900]/20 shadow-xs"
            >
              <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 hover:scale-110 transition-all shadow-md"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[8px] font-black rounded-md">
                {idx === 0 ? 'Cover' : `#${idx + 1}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Drop Area */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-emerald-300 hover:border-[#014900] bg-white rounded-2xl p-4 text-center cursor-pointer transition-colors group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#014900] group-hover:bg-[#014900] group-hover:text-white transition-colors flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-gray-700">
              Drag & drop pictures here, or <span className="text-[#014900] underline font-black">browse files</span>
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              Supports PNG, JPG, WebP up to 5MB each
            </p>
          </div>
        </div>
      )}

      {/* Direct URL Input Toggle */}
      {images.length < maxImages && (
        <div>
          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-[11px] font-bold text-[#014900] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-[#D9A000]" />
              <span>Or attach image via URL</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="url"
                placeholder="Paste direct image URL (https://...)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#014900] font-medium"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-3.5 py-2 bg-[#014900] text-white text-xs font-black uppercase rounded-xl hover:bg-[#D9A000] hover:text-[#014900] transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
