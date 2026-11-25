'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, Check } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Upload Image',
  folder = 'bellfix',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image size exceeds 8MB limit.');
      return;
    }

    setUploadError('');
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      onChange(data.url);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2500);
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      setUploadError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
        {label}
      </label>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Current Preview or Placeholder */}
      {value ? (
        <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-gray-100 shadow-2xs group">
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width: 600px) 100vw, 500px"
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-[#101820] text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer shadow-xs"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-red-700 cursor-pointer shadow-xs flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-[#1c71cd] rounded-lg p-6 text-center cursor-pointer transition-colors bg-[#F5F8FA] hover:bg-white"
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 text-xs text-[#1c71cd]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Uploading to Cloud Storage...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1c71cd] shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#101820]">
                Click to browse or upload image
              </span>
              <span className="text-[11px] text-gray-400">
                Supports JPG, PNG, WEBP (Up to 8MB)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Direct URL input fallback */}
      <div className="pt-1">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter image URL directly"
          className="w-full bg-[#F5F8FA] px-3 py-2 text-xs rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
        />
      </div>

      {uploadSuccess && (
        <p className="text-xs text-emerald-600 flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> Image uploaded successfully!
        </p>
      )}

      {uploadError && (
        <p className="text-xs text-red-600">
          {uploadError}
        </p>
      )}
    </div>
  );
}
