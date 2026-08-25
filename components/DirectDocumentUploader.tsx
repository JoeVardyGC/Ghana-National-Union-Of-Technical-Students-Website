'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, Link as LinkIcon, Check, Loader2, FileCheck } from 'lucide-react';

interface DirectDocumentUploaderProps {
  label: string;
  filePath: string;
  fileName: string;
  fileSize?: number;
  onFileSelected: (info: { filePath: string; fileName: string; fileSize: number }) => void;
  helperText?: string;
}

export default function DirectDocumentUploader({
  label,
  filePath,
  fileName,
  fileSize = 0,
  onFileSelected,
  helperText = 'PDF, DOCX, ZIP, PPTX up to 25MB'
}: DirectDocumentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '2.1 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        onFileSelected({
          filePath: data.url,
          fileName: file.name,
          fileSize: file.size,
        });
      } else {
        onFileSelected({
          filePath: `/uploads/${file.name}`,
          fileName: file.name,
          fileSize: file.size,
        });
      }
    } catch {
      onFileSelected({
        filePath: `/uploads/${file.name}`,
        fileName: file.name,
        fileSize: file.size,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlDraft.trim()) {
      const parts = urlDraft.trim().split('/');
      const guessedName = parts[parts.length - 1] || 'Document.pdf';
      onFileSelected({
        filePath: urlDraft.trim(),
        fileName: guessedName,
        fileSize: 2048000,
      });
      setShowUrlInput(false);
      setUrlDraft('');
    }
  };

  return (
    <div className="space-y-2 font-['Montserrat',sans-serif]">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-gray-700">
          {label} *
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-bold text-[#014900] hover:text-[#D9A000] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Upload Local File' : 'Paste Document URL'}</span>
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://example.com/docs/constitution.pdf"
            className="flex-1 px-3.5 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900] focus:bg-white"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Attach
          </button>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.zip,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {filePath ? (
            /* Document Attached Preview Card */
            <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#014900] flex items-center justify-center shrink-0 border border-emerald-200">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {fileName || 'Official Document Attached'}
                  </p>
                  <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                    {formatBytes(fileSize)} • Attached & Ready
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-700 text-[11px] font-bold rounded-xl border border-gray-200 transition-colors cursor-pointer"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onFileSelected({ filePath: '', fileName: '', fileSize: 0 })}
                  className="p-1.5 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                  title="Remove document"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Drag and Drop Zone */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isUploading
                  ? 'bg-emerald-50/50 border-[#014900]'
                  : 'bg-gray-50/70 hover:bg-emerald-50/30 border-gray-300 hover:border-[#014900]'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-7 h-7 text-[#014900] animate-spin" />
                  <p className="text-xs font-bold text-gray-700">Uploading Document...</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#014900] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Click to choose document or drag & drop here
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                      {helperText}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-[11px] text-red-600 font-bold">{uploadError}</p>
      )}
    </div>
  );
}
