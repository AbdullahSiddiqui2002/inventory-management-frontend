'use client';

import React from 'react';
import { Modal } from '../common/Modal';
import { Product } from '@/types';
import { StockBadge } from '../common/Badge';
import { DollarSign, Layers, Truck, FileText, Building2, FileImage, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit?: (product: Product) => void;
  onViewSlip?: (slipUrl: string, product: Product) => void;
}

export const ProductDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  product,
  onEdit,
  onViewSlip,
}) => {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Material Details & Slip Inspection"
      subtitle={`Material ID #${product.productId}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Header summary */}
        <div className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{product.name}</h4>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                {product.categoryName || 'General'}
              </span>
              {product.projectName && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>{product.projectName}</span>
                </span>
              )}
            </div>
          </div>
          <StockBadge quantity={product.quantity} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Unit Rate</span>
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
              PKR {product.price.toLocaleString('en-PK')}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Available Stock</span>
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
              {product.quantity.toLocaleString()} <span className="text-xs text-slate-500 font-sans font-medium">{product.unit || 'Units'}</span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Total Valuation</span>
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
              PKR {(product.price * product.quantity).toLocaleString('en-PK')}
            </p>
          </div>
        </div>

        {/* Supplier Delivery Slip Box (Cloudinary) */}
        {product.receiptSlipUrl ? (
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  Supplier Delivery / Challan Slip
                </span>
              </div>
              <button
                type="button"
                onClick={() => onViewSlip && onViewSlip(product.receiptSlipUrl!, product)}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Inspect Full Slip</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div
              onClick={() => onViewSlip && onViewSlip(product.receiptSlipUrl!, product)}
              className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-900 cursor-pointer group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.receiptSlipUrl}
                alt="Supplier Delivery Slip"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-lg">
                  🔍 Click to Zoom Slip
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 italic text-center">
            No supplier invoice or delivery slip attached to this material record.
          </div>
        )}

        {/* Supplier Info */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            <Truck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Supplier / Vendor</span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{product.supplierName || 'Assigned Supplier'}</p>
        </div>

        {/* Description / Challan notes */}
        {product.description && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Challan / Material Specifications</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-500/20"
            >
              Edit Material
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
