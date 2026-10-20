'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { StockBadge } from '../common/Badge';
import { AlertTriangle, ArrowRight, PackageOpen, PlusCircle } from 'lucide-react';

interface Props {
  products: Product[];
  onQuickRestock?: (product: Product) => void;
}

export const LowStockAlerts: React.FC<Props> = ({ products, onQuickRestock }) => {
  const lowStockItems = products
    .filter((p) => p.quantity <= 15)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 5);

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Low Stock Warnings</h3>
              {lowStockItems.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300">
                  {lowStockItems.length} Critical
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Site materials requiring immediate reorder</p>
          </div>
        </div>

        <Link
          href="/inventory-alerts"
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {lowStockItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-500 gap-2">
          <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <PackageOpen className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">All Materials Well Stocked!</p>
          <p className="text-xs text-slate-500">No construction materials are currently under critical threshold.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {lowStockItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all group"
            >
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.name}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-semibold text-blue-700 dark:text-blue-400">
                    {item.categoryName || 'General'}
                  </span>
                  <span>•</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    PKR {item.price.toLocaleString('en-PK')}
                  </span>
                  {item.unit && (
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      / {item.unit}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StockBadge quantity={item.quantity} />
                <Link
                  href={`/products`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                  title="Inspect Material"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
