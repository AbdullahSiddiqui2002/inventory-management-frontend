'use client';

import React, { useState } from 'react';
import { Supplier } from '@/types';
import { Search, Truck, Edit2, Trash2, Plus, Phone, MapPin, Layers, Package } from 'lucide-react';

interface Props {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onAddNew: () => void;
  onBulkAdd: () => void;
}

export const SupplierList: React.FC<Props> = ({
  suppliers,
  onEdit,
  onDelete,
  onAddNew,
  onBulkAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, phone, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBulkAdd}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Add</span>
          </button>
          <button
            onClick={onAddNew}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Supplier</span>
          </button>
        </div>
      </div>

      {/* Grid of Supplier Directory Cards */}
      {filteredSuppliers.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <Truck className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">No suppliers found</h4>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search or add a new supplier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => {
            const productCount = supplier.products?.length || 0;
            const totalStock = supplier.products?.reduce((acc, p) => acc + (p.quantity || 0), 0) || 0;

            return (
              <div
                key={supplier.id}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{supplier.name}</h4>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">ID #{supplier.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(supplier)}
                        title="Edit supplier"
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(supplier)}
                        title="Delete supplier"
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-4">
                    {supplier.phone && (
                      <a
                        href={`tel:${supplier.phone}`}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono">{supplier.phone}</span>
                      </a>
                    )}
                    {supplier.address && (
                      <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{supplier.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Stock Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60">
                      <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">Products</span>
                      <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">{productCount} Items</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60">
                      <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">Units</span>
                      <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">{totalStock} Total</span>
                    </div>
                  </div>
                </div>

                {supplier.products && supplier.products.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/40">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1 font-medium">
                      <Package className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span>Supplied Catalog:</span>
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.products.slice(0, 3).map((p) => (
                        <span
                          key={p.productId}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 truncate max-w-[120px]"
                        >
                          {p.name}
                        </span>
                      ))}
                      {supplier.products.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-slate-400 dark:text-slate-500">
                          +{supplier.products.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
