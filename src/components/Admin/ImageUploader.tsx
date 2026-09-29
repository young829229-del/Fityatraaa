import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import {
  Upload,
  X,
  Check,
  Loader2,
  Image as ImageIcon,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Eye,
  RefreshCw,
  GripVertical
} from 'lucide-react';
import { uploadFileToStorage } from '../../services/storageService';

interface ImageUploaderProps {
  label?: string;
  folder?: string;
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  aspectRatio?: 'square' | 'wide' | 'tall';
  helperText?: string;
}

export default function ImageUploader({
  label = 'Upload Photos',
  folder = 'uploads',
  images = [],
  onChange,
  multiple = true,
  maxFiles = 999,
  aspectRatio = 'square',
  helperText
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setStatusMessage('Uploading...');
    setUploadProgress(10);

    const fileList = Array.from(files);
    const newUrls: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        setStatusMessage(`Uploading ${i + 1} of ${fileList.length}...`);
        const result = await uploadFileToStorage(file, folder, (percent) => {
          const stepPercent = ((i + percent / 100) / fileList.length) * 100;
          setUploadProgress(Math.round(stepPercent));
        });
        if (result.url) {
          newUrls.push(result.url);
        }
      } catch (err) {
        console.error('File upload failed:', err);
      }
    }

    if (newUrls.length > 0) {
      if (multiple) {
        onChange([...images, ...newUrls].slice(0, maxFiles));
      } else {
        onChange([newUrls[0]]);
      }
      setStatusMessage('✓ Uploaded');
      setTimeout(() => setStatusMessage(''), 2500);
    } else {
      setStatusMessage('✕ Upload failed — Try again');
      setTimeout(() => setStatusMessage(''), 3000);
    }

    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplaceFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceIndex === null) return;

    setUploading(true);
    setStatusMessage('Replacing image...');
    setUploadProgress(15);

    try {
      const result = await uploadFileToStorage(file, folder, (percent) => {
        setUploadProgress(percent);
      });
      if (result.url) {
        const next = [...images];
        next[replaceIndex] = result.url;
        onChange(next);
        setStatusMessage('✓ Image replaced');
        setTimeout(() => setStatusMessage(''), 2500);
      }
    } catch (err) {
      console.error('Replace image error:', err);
      setStatusMessage('✕ Replace failed');
      setTimeout(() => setStatusMessage(''), 2500);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setReplaceIndex(null);
      if (replaceInputRef.current) {
        replaceInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const next = [...images];
    next.splice(index, 1);
    onChange(next);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    onChange(next);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  // Drag and Drop Reordering
  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const next = [...images];
    const [moved] = next.splice(draggedIndex, 1);
    next.splice(dropIndex, 0, moved);
    onChange(next);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const ratioClass =
    aspectRatio === 'wide'
      ? 'aspect-[16/9]'
      : aspectRatio === 'tall'
      ? 'aspect-[3/4]'
      : 'aspect-square';

  return (
    <div className="w-full flex flex-col space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-neutral-600" />
            <span>{label}</span>
          </label>
          <span className="text-[11px] font-mono text-neutral-400">
            {maxFiles >= 100 ? `${images.length} uploaded (Unlimited)` : `${images.length} / ${maxFiles}`}
          </span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={multiple}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceFileChange}
        multiple={false}
        accept="image/*"
        className="hidden"
      />

      {/* Uploading Status Banner */}
      {uploading && (
        <div className="w-full bg-amber-50 border border-amber-200 p-3 rounded-lg flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>{statusMessage}</span>
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Temporary Success/Error message */}
      {!uploading && statusMessage && (
        <div
          className={`text-xs font-bold px-3 py-2 rounded-lg border flex items-center gap-2 ${
            statusMessage.includes('✓')
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-red-50 text-red-800 border-red-300'
          }`}
        >
          {statusMessage.includes('✓') ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <X className="w-4 h-4 text-red-600" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Images Grid with Drag-and-Drop Reorder */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((url, idx) => (
          <div
            key={`${idx}-${url.slice(-18)}`}
            draggable={multiple && images.length > 1}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={() => {
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
            onDrop={(e) => handleDrop(e, idx)}
            className={`relative group bg-neutral-100 border rounded-lg overflow-hidden ${ratioClass} shadow-xs flex items-center justify-center transition-all ${
              dragOverIndex === idx
                ? 'border-2 border-[#FFCD00] scale-[1.02]'
                : 'border-neutral-300'
            } ${multiple && images.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
            <img
              src={url}
              alt={`Asset ${idx + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain p-1 pointer-events-none"
            />

            {/* Primary Badge */}
            {idx === 0 && multiple && (
              <span className="absolute top-2 left-2 bg-[#FFCD00] text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                Primary
              </span>
            )}

            {/* Drag Handle Indicator */}
            {multiple && images.length > 1 && (
              <span className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded opacity-70 group-hover:opacity-100">
                <GripVertical className="w-3 h-3" />
              </span>
            )}

            {/* Hover / Touch Controls */}
            <div className="absolute inset-0 bg-neutral-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-white">
              {idx !== 0 && multiple && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(idx)}
                  className="px-2 py-1 bg-[#FFCD00] text-black text-[10px] font-extrabold uppercase rounded hover:bg-amber-400 transition-colors cursor-pointer w-full max-w-[110px]"
                >
                  Set Primary
                </button>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewUrl(url)}
                  className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded cursor-pointer"
                  title="Preview Image"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReplaceIndex(idx);
                    replaceInputRef.current?.click();
                  }}
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
                  title="Replace Image"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                  title="Delete Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {multiple && images.length > 1 && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'left')}
                      className="p-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded cursor-pointer"
                      title="Move Left"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'right')}
                      className="p-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded cursor-pointer"
                      title="Move Right"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Upload Trigger Button Card */}
        {(multiple || images.length < maxFiles) && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer group ${ratioClass}`}
          >
            <div className="w-10 h-10 rounded-full bg-neutral-200 group-hover:bg-[#FFCD00] flex items-center justify-center mb-2 transition-colors">
              <Upload className="w-5 h-5 text-neutral-700 group-hover:text-black" />
            </div>
            <span className="text-xs font-black uppercase text-neutral-800 group-hover:text-black">
              {multiple ? '+ Upload Images' : images.length > 0 ? 'Replace Photo' : '+ Upload Photo'}
            </span>
          </button>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-neutral-500 leading-normal">
          {helperText}
        </p>
      )}

      {/* Fullscreen Lightbox Preview Modal */}
      {previewUrl && (
        <div
          onClick={() => setPreviewUrl(null)}
          className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[88vh] bg-white p-2 rounded-2xl shadow-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 bg-neutral-950 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewUrl}
              alt="Preview"
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[82vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
