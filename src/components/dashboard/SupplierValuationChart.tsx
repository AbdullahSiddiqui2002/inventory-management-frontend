'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Supplier, Product } from '@/types';
import { Truck, Boxes, DollarSign } from 'lucide-react';

interface Props {
  suppliers: Supplier[];
  products: Product[];
}

export const SupplierValuationChart: React.FC<Props> = ({ suppliers, products }) => {
  const [mounted, setMounted] = useState(false);
  const [metric, setMetric] = useState<'units' | 'valuation'>('units');

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = useMemo(() => {
    if (!products.length) return [];

    const map = new Map<number | string, { name: string; fullName: string; units: number; valuation: number; items: number }>();

    products.forEach((p) => {
      const key = p.supplierId || 'unknown';
      const supName = p.supplierName || suppliers.find((s) => s.id === p.supplierId)?.name || 'Unknown Supplier';
      const shortName = supName.split(' ')[0];
      const val = (p.price || 0) * (p.quantity || 0);

      const existing = map.get(key) || { name: shortName, fullName: supName, units: 0, valuation: 0, items: 0 };
      existing.units += p.quantity || 0;
      existing.valuation += val;
      existing.items += 1;
      map.set(key, existing);
    });

    return Array.from(map.values())
      .sort((a, b) => (metric === 'units' ? b.units - a.units : b.valuation - a.valuation))
      .slice(0, 6);
  }, [products, suppliers, metric]);

  const totalVolume = useMemo(() => {
    return data.reduce((acc, d) => acc + (metric === 'units' ? d.units : d.valuation), 0);
  }, [data, metric]);

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Top Suppliers & Logistics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inventory delivery volume from active vendors</p>
          </div>
        </div>

        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 self-start sm:self-auto">
          <button
            onClick={() => setMetric('units')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              metric === 'units'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Boxes className="w-3 h-3" />
            <span>Volume (Units)</span>
          </button>
          <button
            onClick={() => setMetric('valuation')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              metric === 'valuation'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-3 h-3" />
            <span>Spend (PKR)</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      {!mounted || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[260px] text-slate-400 dark:text-slate-500 gap-2">
          <Truck className="w-10 h-10 opacity-30 animate-pulse" />
          <p className="text-xs font-medium">No supplier deliveries recorded yet.</p>
        </div>
      ) : (
        <div className="w-full h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 12, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                tickFormatter={(val) =>
                  metric === 'units'
                    ? val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                    : val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl text-xs z-50">
                        <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">{item.fullName}</p>
                        <div className="space-y-0.5 text-slate-600 dark:text-slate-400 font-mono">
                          <p>
                            Material Types: <span className="font-bold text-slate-800 dark:text-slate-200">{item.items}</span>
                          </p>
                          <p>
                            Total Volume: <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.units.toLocaleString()} Units</span>
                          </p>
                          <p>
                            Total Expenditure: <span className="font-bold text-blue-600 dark:text-blue-400">PKR {item.valuation.toLocaleString('en-PK')}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey={metric === 'units' ? 'units' : 'valuation'} radius={[8, 8, 0, 0]} barSize={32}>
                {data.map((_, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={index === 0 ? '#6366f1' : index === 1 ? '#3b82f6' : '#8b5cf6'}
                    className="transition-all hover:opacity-85 cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer Stats summary */}
      {data.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Top Vendor: <strong className="text-slate-800 dark:text-slate-200">{data[0]?.fullName}</strong></span>
          <span className="font-mono">
            {metric === 'units'
              ? `${totalVolume.toLocaleString()} Total Units Tracked`
              : `PKR ${totalVolume.toLocaleString('en-PK')}`}
          </span>
        </div>
      )}
    </div>
  );
};
