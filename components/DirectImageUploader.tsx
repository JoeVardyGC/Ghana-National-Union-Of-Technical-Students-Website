'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Check, Loader2 } from 'lucide-react';

interface DirectImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
}

// Helper to compress image in browser to ~50KB-100KB for instant storage
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string || '');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export default function DirectImageUploader({
  label,
  value,
  onChange,
  helperText = 'PNG, JPG, WebP up to 10MB'
}: DirectImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        onChange(data.url);
      } else {
        // Fallback: Read as compressed DataURL for instant zero-error storage
        const compressed = await compressImage(file);
        if (compressed) {
          onChange(compressed);
        }
      }
    } catch {
      // Offline / serverless fallback: Compressed DataURL
      const compressed = await compressImage(file);
      if (compressed) {
        onChange(compressed);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setUrlDraft('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-1.5 bg-gray-50/80 p-3 rounded-2xl border border-gray-200/90 font-['Montserrat',sans-serif]">
      
      {/* Label and Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#014900]" />
          <span>{label}</span>
        </label>
        
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-bold text-[#014900] hover:text-[#D9A000] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>{showUrlInput ? 'Upload File' : 'Paste Image URL'}</span>
          </button>
        )}
      </div>

      {uploadError && (
        <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
          {uploadError}
        </p>
      )}

      {/* Upload Zone or Preview */}
      {value ? (
        /* 1. Image Preview with replace/delete overlay */
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white h-32 flex items-center justify-center">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-gray-900 font-bold text-xs rounded-xl shadow-md hover:bg-[#014900] hover:text-white transition-colors cursor-pointer"
            >
              Replace Photo
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-red-700 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
        </div>
      ) : showUrlInput ? (
        /* 2. URL Input Mode */
        <div className="flex items-center gap-2 pt-1">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Paste image link (https://...)"
            className="flex-1 px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-[#014900]"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 bg-[#014900] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#D9A000] hover:text-[#014900] transition-colors cursor-pointer"
          >
            Attach
          </button>
        </div>
      ) : (
        /* 3. Drag and Drop Direct Upload Dropzone */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-emerald-400/80 hover:border-[#014900] bg-white rounded-2xl p-3 text-center cursor-pointer transition-all hover:bg-emerald-50/40 group flex items-center justify-center gap-3"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#014900] group-hover:bg-[#014900] group-hover:text-white transition-colors flex items-center justify-center shrink-0 shadow-xs">
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </div>

          <div className="text-left">
            <p className="text-xs font-bold text-gray-800 leading-tight">
              {isUploading ? (
                'Uploading image file...'
              ) : (
                <>
                  Click to <span className="text-[#014900] font-black underline">browse image</span> or drag & drop
                </>
              )}
            </p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{helperText}</p>
          </div>
        </div>
      )}

    </div>
  );
}
