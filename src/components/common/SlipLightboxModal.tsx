'use client';

import React from 'react';
import { X, Download, ExternalLink, FileImage } from 'lucide-react';

interface SlipLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  materialName?: string;
  supplierName?: string;
}

export const SlipLightboxModal: React.FC<SlipLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  materialName,
  supplierName,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Lightbox Container */}
      <div
        className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {materialName ? `${materialName} — Supplier Slip` : 'Supplier Invoice / Delivery Slip'}
              </h3>
              {supplierName && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Issued by: {supplierName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Open full image in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={imageUrl}
              download="supplier_slip.jpg"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* High-Res Image Viewport */}
        <div className="flex-1 p-4 bg-slate-950 flex items-center justify-center overflow-auto min-h-[350px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Supplier Delivery Slip Inspection"
            className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};
