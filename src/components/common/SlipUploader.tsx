'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, Loader2, ExternalLink } from 'lucide-react';
import { uploadToCloudinary } from '@/services/cloudinary';
import { useNotification } from '@/context/NotificationContext';

interface SlipUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
}

export const SlipUploader: React.FC<SlipUploaderProps> = ({
  value = '',
  onChange,
  label = 'Supplier Invoice / Delivery Slip Image',
  helperText = 'Upload receipt or delivery challan slip (Stored on Cloudinary: diwj4lcwc)',
}) => {
  const { success, error } = useNotification();
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      error('Invalid File', 'Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setIsUploading(true);
    try {
      const secureUrl = await uploadToCloudinary(file);
      onChange(secureUrl);
      success('Slip Uploaded', 'Supplier receipt slip saved to Cloudinary.');
    } catch (err: any) {
      error('Upload Failed', err?.message || 'Failed to upload receipt slip.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>View Full Slip</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Thumbnail Preview */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shrink-0 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Supplier Slip Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Supplier Delivery Slip Attached</span>
              </p>
              <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5 max-w-[280px]">
                {value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-500/15 hover:bg-rose-200 dark:hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 transition-colors"
              title="Remove slip image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
            dragOver
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10'
              : 'border-slate-300 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/40'
          }`}
        >
          {isUploading ? (
            <div className="flex items-center gap-2 py-2 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading to Cloudinary...</span>
            </div>
          ) : (
            <>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click to upload or drag & drop Supplier Receipt Slip
              </p>
              <p className="text-[11px] text-slate-500">{helperText}</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
        className="hidden"
      />
    </div>
  );
};
