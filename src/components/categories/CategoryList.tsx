'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Category, Product } from '@/types';
import {
  Search,
  Tags,
  Edit2,
  Trash2,
  Layers,
  Package,
  Boxes,
  Coins,
  ArrowUpRight,
  LayoutGrid,
  List,
  X,
  Hammer,
  Building2,
  Droplets,
  Zap,
  Sparkles,
  ShieldCheck,
  Paintbrush,
  DoorClosed,
  CircleDot,
  TrendingUp,
} from 'lucide-react';

interface Props {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddNew: () => void;
  onBulkAdd: () => void;
}

type FilterScope = 'all' | 'in-stock' | 'empty';
type SortOption = 'id-asc' | 'name-asc' | 'name-desc' | 'products-desc' | 'units-desc' | 'val-desc';

// Themed visual styling helper based on category name
function getCategoryVisuals(name: string) {
  const lower = name.toLowerCase();

  if (lower.includes('cement') || lower.includes('concrete') || lower.includes('mortar')) {
    return {
      icon: Layers,
      bg: 'bg-stone-500/10 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800',
      accentGlow: 'from-stone-500/20 to-zinc-500/5',
      badgeClass: 'bg-stone-100 dark:bg-stone-900/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800',
      categoryType: 'Structural & Binding',
    };
  }
  if (lower.includes('steel') || lower.includes('rebar') || lower.includes('structural') || lower.includes('iron')) {
    return {
      icon: Hammer,
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
      accentGlow: 'from-amber-500/20 to-orange-500/5',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
      categoryType: 'Reinforcement & Framing',
    };
  }
  if (lower.includes('brick') || lower.includes('block') || lower.includes('masonry')) {
    return {
      icon: Building2,
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
      accentGlow: 'from-rose-500/20 to-red-500/5',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
      categoryType: 'Civil & Masonry',
    };
  }
  if (lower.includes('plumbing') || lower.includes('pipe') || lower.includes('pvc') || lower.includes('drainage')) {
    return {
      icon: Droplets,
      bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/40',
      accentGlow: 'from-cyan-500/20 to-sky-500/5',
      badgeClass: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40',
      categoryType: 'Public Health & Piping',
    };
  }
  if (lower.includes('electric') || lower.includes('cable') || lower.includes('conduit') || lower.includes('wire')) {
    return {
      icon: Zap,
      bg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/40',
      accentGlow: 'from-yellow-500/20 to-amber-500/5',
      badgeClass: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/40',
      categoryType: 'Electrification & Power',
    };
  }
  if (lower.includes('aggregate') || lower.includes('sand') || lower.includes('crush') || lower.includes('gravel')) {
    return {
      icon: CircleDot,
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
      accentGlow: 'from-emerald-500/20 to-teal-500/5',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
      categoryType: 'Sub-base & Aggregates',
    };
  }
  if (lower.includes('tile') || lower.includes('marble') || lower.includes('porcelain') || lower.includes('granite')) {
    return {
      icon: Sparkles,
      bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40',
      accentGlow: 'from-indigo-500/20 to-purple-500/5',
      badgeClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40',
      categoryType: 'Finishing & Flooring',
    };
  }
  if (lower.includes('sanitary') || lower.includes('bath') || lower.includes('fitting')) {
    return {
      icon: ShieldCheck,
      bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/40',
      accentGlow: 'from-teal-500/20 to-blue-500/5',
      badgeClass: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/40',
      categoryType: 'Bath & Sanitaryware',
    };
  }
  if (lower.includes('paint') || lower.includes('primer') || lower.includes('waterproof') || lower.includes('coating')) {
    return {
      icon: Paintbrush,
      bg: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800/40',
      accentGlow: 'from-fuchsia-500/20 to-pink-500/5',
      badgeClass: 'bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800/40',
      categoryType: 'Protective Coatings',
    };
  }
  if (lower.includes('wood') || lower.includes('teak') || lower.includes('timber') || lower.includes('door') || lower.includes('plywood')) {
    return {
      icon: DoorClosed,
      bg: 'bg-amber-600/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/50',
      accentGlow: 'from-amber-600/20 to-yellow-600/5',
      badgeClass: 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700/50',
      categoryType: 'Carpentry & Millwork',
    };
  }

  // Default
  return {
    icon: Tags,
    bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    accentGlow: 'from-blue-500/20 to-indigo-500/5',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20',
    categoryType: 'Construction Material',
  };
}

// Compact currency formatter
function formatPKR(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  return amount.toLocaleString('en-PK');
}

export const CategoryList: React.FC<Props> = ({
  categories,
  onEdit,
  onDelete,
  onAddNew,
  onBulkAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScope, setFilterScope] = useState<FilterScope>('all');
  const [sortBy, setSortBy] = useState<SortOption>('id-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter & Sort Logic
  const filteredCategories = useMemo(() => {
    let result = categories.filter((c) => {
      const term = searchTerm.toLowerCase();
      const matchName = c.name.toLowerCase().includes(term);
      const matchProducts = c.products?.some((p) => p.name.toLowerCase().includes(term)) || false;
      const matchesSearch = matchName || matchProducts;

      if (!matchesSearch) return false;

      const totalStock = c.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
      if (filterScope === 'in-stock') return totalStock > 0;
      if (filterScope === 'empty') return (c.products?.length || 0) === 0;
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      const aUnits = a.products?.reduce((s, p) => s + (p.quantity || 0), 0) || 0;
      const bUnits = b.products?.reduce((s, p) => s + (p.quantity || 0), 0) || 0;
      const aVal = a.products?.reduce((s, p) => s + (p.price || 0) * (p.quantity || 0), 0) || 0;
      const bVal = b.products?.reduce((s, p) => s + (p.price || 0) * (p.quantity || 0), 0) || 0;
      const aCount = a.products?.length || 0;
      const bCount = b.products?.length || 0;

      switch (sortBy) {
        case 'id-asc':
          return a.categoryId - b.categoryId;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'products-desc':
          return bCount - aCount;
        case 'units-desc':
          return bUnits - aUnits;
        case 'val-desc':
          return bVal - aVal;
        default:
          return a.categoryId - b.categoryId;
      }
    });

    return result;
  }, [categories, searchTerm, filterScope, sortBy]);

  // Counts for filter tabs
  const filterCounts = useMemo(() => {
    const inStock = categories.filter((c) => (c.products?.reduce((s, p) => s + (p.quantity || 0), 0) || 0) > 0).length;
    const empty = categories.filter((c) => (c.products?.length || 0) === 0).length;
    return {
      all: categories.length,
      inStock,
      empty,
    };
  }, [categories]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories or material keywords (e.g. Rebar, Cement)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-xs sm:text-sm border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Scope Filters */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setFilterScope('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterScope === 'all'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({filterCounts.all})
            </button>
            <button
              onClick={() => setFilterScope('in-stock')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterScope === 'in-stock'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              In Stock ({filterCounts.inStock})
            </button>
            <button
              onClick={() => setFilterScope('empty')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterScope === 'empty'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Empty ({filterCounts.empty})
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 rounded-xl glass-input text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer"
          >
            <option value="id-asc">Sort: ID (Default)</option>
            <option value="name-asc">Sort: Name (A → Z)</option>
            <option value="name-desc">Sort: Name (Z → A)</option>
            <option value="products-desc">Sort: Most SKUs</option>
            <option value="units-desc">Sort: Highest Stock Units</option>
            <option value="val-desc">Sort: Highest Valuation (PKR)</option>
          </select>

          {/* Grid / Table Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Dense Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Header Status */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredCategories.length}</strong> of{' '}
          {categories.length} categories
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Content Display: Empty State */}
      {filteredCategories.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center border border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 border border-blue-200 dark:border-blue-500/20 mb-3">
            <Tags className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No categories found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {searchTerm
              ? `No category names or material items match "${searchTerm}".`
              : 'There are currently no categories in this filter view.'}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Clear Search
              </button>
            )}
            <button
              onClick={onAddNew}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-500/20"
            >
              + Create Category
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* ================= GRID VIEW ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const visual = getCategoryVisuals(cat.name);
            const IconComponent = visual.icon;
            const productCount = cat.products?.length || 0;
            const totalStock = cat.products?.reduce((acc, p) => acc + (p.quantity || 0), 0) || 0;
            const totalValuation =
              cat.products?.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 0), 0) || 0;

            return (
              <div
                key={cat.categoryId}
                className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/40 hover:shadow-xl dark:hover:shadow-blue-500/5 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Subtle top ambient accent bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${visual.accentGlow}`}
                />

                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-3 rounded-2xl border shadow-sm flex-shrink-0 ${visual.bg}`}
                        title={visual.categoryType}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-700/60">
                            #{cat.categoryId.toString().padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                            {visual.categoryType}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-snug mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {cat.name}
                        </h4>
                      </div>
                    </div>

                    {/* Quick Edit & Delete */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onEdit(cat)}
                        title="Edit category name"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(cat)}
                        title="Delete category"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 3 Metric Badges */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-bold">
                        SKUs
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                        {productCount}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-bold">
                        Stock
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                        {totalStock.toLocaleString('en-PK')}
                      </span>
                    </div>

                    <div
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 text-center"
                      title={`Exact: PKR ${totalValuation.toLocaleString('en-PK')}`}
                    >
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-bold">
                        Valuation
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        PKR {formatPKR(totalValuation)}
                      </span>
                    </div>
                  </div>

                  {/* Sample Materials Pill Previews */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1 font-medium">
                      <Package className="w-3 h-3 text-slate-400" />
                      <span>Sample Materials:</span>
                    </p>
                    {cat.products && cat.products.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {cat.products.slice(0, 3).map((p) => (
                          <span
                            key={p.productId}
                            title={`${p.name} • ${p.quantity} ${p.unit || 'Units'}`}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 truncate max-w-[150px] font-medium"
                          >
                            {p.name}
                          </span>
                        ))}
                        {cat.products.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 font-semibold">
                            +{cat.products.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                        No materials assigned to this category
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer: Jump to Materials */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {productCount} {productCount === 1 ? 'Material item' : 'Material items'}
                  </span>
                  <Link
                    href={`/products?category=${cat.categoryId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Browse Materials</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= DENSE TABLE VIEW ================= */
        <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 w-16"># ID</th>
                  <th className="py-3 px-4">Category Classification</th>
                  <th className="py-3 px-4 text-center">SKUs</th>
                  <th className="py-3 px-4 text-right">Units In Stock</th>
                  <th className="py-3 px-4 text-right">Total Valuation (PKR)</th>
                  <th className="py-3 px-4">Sample Items</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredCategories.map((cat) => {
                  const visual = getCategoryVisuals(cat.name);
                  const IconComponent = visual.icon;
                  const productCount = cat.products?.length || 0;
                  const totalStock =
                    cat.products?.reduce((acc, p) => acc + (p.quantity || 0), 0) || 0;
                  const totalValuation =
                    cat.products?.reduce(
                      (acc, p) => acc + (p.price || 0) * (p.quantity || 0),
                      0
                    ) || 0;

                  return (
                    <tr
                      key={cat.categoryId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-400 dark:text-slate-500 font-semibold">
                        #{cat.categoryId.toString().padStart(2, '0')}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl border ${visual.bg}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {visual.categoryType}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                          {productCount} {productCount === 1 ? 'SKU' : 'SKUs'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {totalStock.toLocaleString('en-PK')} Units
                      </td>

                      <td
                        className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400"
                        title={`Exact: PKR ${totalValuation.toLocaleString('en-PK')}`}
                      >
                        PKR {formatPKR(totalValuation)}
                      </td>

                      <td className="py-3.5 px-4">
                        {cat.products && cat.products.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                            {cat.products.slice(0, 2).map((p) => (
                              <span
                                key={p.productId}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 truncate max-w-[130px]"
                              >
                                {p.name}
                              </span>
                            ))}
                            {cat.products.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{cat.products.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No SKUs</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products?category=${cat.categoryId}`}
                            className="px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 font-semibold text-xs transition-colors flex items-center gap-1"
                            title="Inspect category materials"
                          >
                            <span>Browse</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>

                          <button
                            onClick={() => onEdit(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDelete(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
