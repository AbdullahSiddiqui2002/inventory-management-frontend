'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { StockBadge } from '../common/Badge';
import { ArrowRight, Package, Clock, Truck } from 'lucide-react';

interface Props {
  products: Product[];
}

export const RecentProductsTable: React.FC<Props> = ({ products }) => {
  const recentItems = [...products].reverse().slice(0, 5);

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Latest Deliveries & Materials</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Recently registered inventory items & challans</p>
          </div>
        </div>

        <Link
          href="/products"
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group"
        >
          <span>Catalog</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {recentItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-500">
          <Package className="w-8 h-8 opacity-40 mb-2" />
          <p className="text-xs font-medium">No materials found in database.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all group"
            >
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.name}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    PKR {item.price.toLocaleString('en-PK')}
                  </span>
                  <span>•</span>
                  <span className="truncate flex items-center gap-1">
                    <Truck className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{item.supplierName || 'General Supplier'}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StockBadge quantity={item.quantity} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
