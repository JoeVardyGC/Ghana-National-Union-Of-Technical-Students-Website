'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Check, 
  Loader2, 
  Crop, 
  Maximize2, 
  Move, 
  Sparkles,
  UserCheck
} from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedUrl: string) => void;
  title?: string;
  defaultAspectRatio?: number; // e.g. 4/5 = 0.8
}

const ASPECT_RATIO_PRESETS = [
  { label: '4:5 Portrait (Executive Card)', value: 4 / 5, desc: 'Recommended standard for executive flyer cards' },
  { label: '1:1 Square (Avatar)', value: 1 / 1, desc: 'Equal width & height' },
  { label: '3:4 Portrait', value: 3 / 4, desc: 'Classic portrait frame' },
  { label: '16:9 Landscape', value: 16 / 9, desc: 'Wide banner mode' },
  { label: 'Freeform', value: 0, desc: 'Preserve natural aspect' },
];

export default function ImageCropperModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  title = 'Crop & Resize Executive Portrait',
  defaultAspectRatio = 4 / 5,
}: ImageCropperModalProps) {
  const [aspectRatio, setAspectRatio] = useState<number>(defaultAspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalDim, setNaturalDim] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Reset when a new image or modal opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setImgLoaded(false);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      img.onload = () => {
        imgRef.current = img;
        setNaturalDim({ width: img.naturalWidth, height: img.naturalHeight });
        setImgLoaded(true);
      };
    }
  }, [isOpen, imageSrc]);

  // Generate live thumbnail preview whenever zoom, offset, or aspect ratio changes
  const updateLivePreview = useCallback(() => {
    if (!imgRef.current || !imgLoaded) return;

    try {
      const img = imgRef.current;
      const targetAspect = aspectRatio > 0 ? aspectRatio : img.naturalWidth / img.naturalHeight;

      // Crop box dimensions in normalized space
      const canvas = document.createElement('canvas');
      const outWidth = 400;
      const outHeight = Math.round(outWidth / targetAspect);
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#014900';
      ctx.fillRect(0, 0, outWidth, outHeight);

      // Compute draw coordinates
      const scale = zoom;
      const drawWidth = outWidth * scale;
      const drawHeight = (img.naturalHeight / img.naturalWidth) * drawWidth;

      const drawX = (outWidth - drawWidth) / 2 + offset.x;
      const drawY = (outHeight - drawHeight) / 2 + offset.y;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.85));
    } catch {
      // ignore preview render glitches
    }
  }, [aspectRatio, zoom, offset, imgLoaded]);

  useEffect(() => {
    if (imgLoaded) {
      updateLivePreview();
    }
  }, [imgLoaded, zoom, offset, aspectRatio, updateLivePreview]);

  // Dragging / Panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile / tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Export & Upload
  const handleSaveCrop = async () => {
    if (!imgRef.current || !imgLoaded) return;
    setIsProcessing(true);

    try {
      const img = imgRef.current;
      const targetAspect = aspectRatio > 0 ? aspectRatio : img.naturalWidth / img.naturalHeight;

      // High-res output canvas (1000px wide for crystal clarity)
      const outWidth = 1000;
      const outHeight = Math.round(outWidth / targetAspect);

      const canvas = document.createElement('canvas');
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas 2D context');
      }

      // Smooth anti-aliased image scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Background fill for transparent images
      ctx.fillStyle = '#014900';
      ctx.fillRect(0, 0, outWidth, outHeight);

      // Scale up the preview coordinates to high-res canvas
      const scaleMultiplier = outWidth / 400;
      const scale = zoom;
      const drawWidth = outWidth * scale;
      const drawHeight = (img.naturalHeight / img.naturalWidth) * drawWidth;

      const drawX = (outWidth - drawWidth) / 2 + offset.x * scaleMultiplier;
      const drawY = (outHeight - drawHeight) / 2 + offset.y * scaleMultiplier;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      // Convert to Blob and Upload to /api/admin/upload
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
      });

      if (blob) {
        const file = new File([blob], `executive-crop-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          onCropComplete(data.url);
          onClose();
          return;
        }
      }

      // Fallback: Export high quality Data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onCropComplete(dataUrl);
      onClose();
    } catch (err) {
      console.error('Error during image crop export:', err);
      if (previewDataUrl) {
        onCropComplete(previewDataUrl);
      }
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-['Montserrat',sans-serif]">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#014900] text-white flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D9A000] text-[#014900] flex items-center justify-center font-bold shadow-xs">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                {title}
              </h3>
              <p className="text-xs text-emerald-200">
                Drag to reposition, zoom, and select your preferred framing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          
          {/* Aspect Ratio Selector Chips */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-700 tracking-wider block">
              Frame Aspect Ratio
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {ASPECT_RATIO_PRESETS.map((preset, idx) => {
                const isSelected = aspectRatio === preset.value;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAspectRatio(preset.value);
                      setOffset({ x: 0, y: 0 });
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#014900] text-white border-[#014900] shadow-md shadow-[#014900]/20'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    <div className="font-extrabold text-xs leading-tight">
                      {preset.label}
                    </div>
                    <div className={`text-[10px] mt-0.5 leading-snug ${isSelected ? 'text-emerald-200' : 'text-gray-400'}`}>
                      {preset.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Crop Viewport & Live Card Preview Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Interactive Canvas Pan & Zoom Viewport (8 Cols) */}
            <div className="lg:col-span-7 bg-gray-900 rounded-3xl p-4 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[420px] relative overflow-hidden select-none shadow-inner border border-gray-800">
              
              {/* Crop Frame Box */}
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative overflow-hidden bg-black/60 rounded-2xl border-2 border-[#D9A000] cursor-grab active:cursor-grabbing shadow-2xl flex items-center justify-center"
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  aspectRatio: aspectRatio > 0 ? `${aspectRatio}` : `${naturalDim.width / (naturalDim.height || 1)}`,
                  maxHeight: '360px',
                }}
              >
                {/* Active Image with Pan & Zoom Transform */}
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt="Crop workspace"
                    draggable={false}
                    className="max-w-none transition-transform duration-75 pointer-events-none"
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                      transformOrigin: 'center center',
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                )}

                {/* Rule of Thirds Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="border-r border-white/20" />
                  <div />
                </div>

                {/* Drag Hint Badge */}
                <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 pointer-events-none shadow-xs">
                  <Move className="w-3 h-3 text-[#D9A000]" />
                  <span>Click & Drag to reposition</span>
                </div>
              </div>
            </div>

            {/* Right: Live Executive Card Preview & Zoom Controls (5 Cols) */}
            <div className="lg:col-span-5 space-y-5 bg-gray-50/80 p-5 rounded-3xl border border-gray-200">
              
              {/* Zoom & Reset Toolbar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-[#014900]" />
                    <span>Zoom Level: {Math.round(zoom * 100)}%</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] font-bold text-[#014900] hover:text-[#D9A000] flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
                    className="p-2 bg-white rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 shadow-xs"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-[#014900] cursor-pointer h-2 bg-gray-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
                    className="p-2 bg-white rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 shadow-xs"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Live Preview on Website Card */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D9A000]" />
                    <span>Live Public Card Preview</span>
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Website Frame
                  </span>
                </div>

                {/* Simulated Executive Card Preview */}
                <div className="w-48 mx-auto bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
                  <div className="aspect-[4/5] w-full bg-[#014900] rounded-t-3xl overflow-hidden relative">
                    {previewDataUrl ? (
                      <img
                        src={previewDataUrl}
                        alt="Crop Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                        Rendering...
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-[#D9A000]" />
                  </div>
                  <div className="p-3 text-center bg-white rounded-b-3xl">
                    <div className="text-xs font-black text-[#014900] truncate">
                      Executive Officer
                    </div>
                    <div className="text-[10px] font-bold text-[#D9A000] uppercase truncate mt-0.5">
                      National Portfolio
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500 font-medium">
            Resolution: {naturalDim.width} × {naturalDim.height}px (High-Def Output)
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              disabled={isProcessing || !imgLoaded}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-[#014900] text-white hover:bg-[#D9A000] hover:text-[#014900] font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing & Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Apply & Save Crop</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
