'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Category, Product } from '@/types';
import { Layers, PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface Props {
  categories: Category[];
  products: Product[];
}

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
];

export const CategoryDistributionChart: React.FC<Props> = ({ categories, products }) => {
  const [mounted, setMounted] = useState(false);
  const [metric, setMetric] = useState<'count' | 'value'>('count');

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!products.length) return [];

    // Map category stats from actual products
    const map = new Map<number | string, { name: string; count: number; totalValue: number; totalUnits: number }>();

    products.forEach((p) => {
      const key = p.categoryId || 'unknown';
      const catName = p.categoryName || categories.find((c) => c.categoryId === p.categoryId)?.name || 'General';
      const val = (p.price || 0) * (p.quantity || 0);

      const existing = map.get(key) || { name: catName, count: 0, totalValue: 0, totalUnits: 0 };
      existing.count += 1;
      existing.totalValue += val;
      existing.totalUnits += p.quantity || 0;
      map.set(key, existing);
    });

    const list = Array.from(map.values())
      .map((item) => ({
        name: item.name,
        value: metric === 'count' ? item.count : item.totalValue,
        count: item.count,
        totalValue: item.totalValue,
        totalUnits: item.totalUnits,
      }))
      .sort((a, b) => b.value - a.value);

    // Keep top 6 and group rest as 'Others'
    if (list.length > 6) {
      const top6 = list.slice(0, 6);
      const rest = list.slice(6);
      const others = {
        name: 'Other Categories',
        value: rest.reduce((acc, c) => acc + c.value, 0),
        count: rest.reduce((acc, c) => acc + c.count, 0),
        totalValue: rest.reduce((acc, c) => acc + c.totalValue, 0),
        totalUnits: rest.reduce((acc, c) => acc + c.totalUnits, 0),
      };
      return [...top6, others];
    }

    return list;
  }, [products, categories, metric]);

  const totalSum = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.value, 0);
  }, [chartData]);

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Stock by Category</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inventory allocation across site categories</p>
          </div>
        </div>

        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 self-start sm:self-auto">
          <button
            onClick={() => setMetric('count')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              metric === 'count'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieIcon className="w-3 h-3" />
            <span>Materials</span>
          </button>
          <button
            onClick={() => setMetric('value')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              metric === 'value'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Valuation (PKR)</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      {!mounted || chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[260px] text-slate-400 dark:text-slate-500 gap-2">
          <Layers className="w-10 h-10 opacity-30 animate-pulse" />
          <p className="text-xs font-medium">No category inventory recorded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Donut Chart */}
          <div className="w-full h-[220px] md:col-span-6 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                      className="transition-all hover:opacity-80 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const percent = totalSum > 0 ? ((item.value / totalSum) * 100).toFixed(1) : 0;
                      return (
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl text-xs z-50">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: payload[0].color }}
                            />
                            <p className="font-bold text-slate-900 dark:text-slate-100">{item.name}</p>
                          </div>
                          <div className="space-y-0.5 text-slate-600 dark:text-slate-400 font-mono">
                            <p>
                              Items: <span className="font-bold text-slate-800 dark:text-slate-200">{item.count}</span>
                            </p>
                            <p>
                              Units: <span className="font-bold text-slate-800 dark:text-slate-200">{item.totalUnits.toLocaleString()}</span>
                            </p>
                            <p className="text-blue-600 dark:text-blue-400 font-bold">
                              Valuation: PKR {item.totalValue.toLocaleString('en-PK')} ({percent}%)
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {metric === 'count' ? 'Materials' : 'Total (PKR)'}
              </span>
              <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                {metric === 'count'
                  ? totalSum
                  : `Rs. ${(totalSum / 1000000).toFixed(1)}M`}
              </span>
            </div>
          </div>

          {/* Legend & Breakdown List */}
          <div className="md:col-span-6 space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
            {chartData.map((item, idx) => {
              const percent = totalSum > 0 ? ((item.value / totalSum) * 100).toFixed(1) : '0';
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {metric === 'count' ? `${item.count} items` : `PKR ${(item.totalValue / 1000).toFixed(0)}k`}
                    </span>
                    <span className="text-[11px] text-slate-400 w-10 text-right">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
