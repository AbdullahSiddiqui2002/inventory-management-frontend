'use client';

import React, { useState, useMemo } from 'react';
import { Product, Category, Supplier, Project } from '@/types';
import { StockBadge } from '../common/Badge';
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Minus,
  ArrowUpDown,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Package,
  FileImage,
  Building2,
  Truck,
  Tags,
  X,
  Filter,
  Coins,
  AlertTriangle,
  ZoomIn,
  ExternalLink,
} from 'lucide-react';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

interface Props {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  projects?: Project[];
  onRefresh: () => void;
  onViewProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onViewSlip: (slipUrl: string, product: Product) => void;
}

export const ProductTable: React.FC<Props> = ({
  products,
  categories,
  suppliers,
  projects = [],
  onRefresh,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  onViewSlip,
}) => {
  const { isAdmin } = useAuth();
  const { success, error } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const cat = new URLSearchParams(window.location.search).get('category');
      if (cat) return cat;
    }
    return 'all';
  });
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'quantity' | 'id' | 'valuation'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Quick Stock Adjustment (+ / -)
  const handleStockAdjust = async (product: Product, delta: number) => {
    const newQuantity = Math.max(0, product.quantity + delta);
    if (newQuantity === product.quantity) return;

    try {
      await apiService.updateProduct(product.productId, {
        productId: product.productId,
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: newQuantity,
        unit: product.unit,
        receiptSlipUrl: product.receiptSlipUrl,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        projectId: product.projectId,
      });
      success('Stock Adjusted', `Updated "${product.name}" quantity to ${newQuantity} ${product.unit}.`);
      onRefresh();
    } catch (err) {
      error('Stock Update Failed', parseErrorMessage(err));
    }
  };

  // Stock status counts
  const stockCounts = useMemo(() => {
    const inStock = products.filter((p) => p.quantity > 15).length;
    const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= 15).length;
    const outOfStock = products.filter((p) => p.quantity <= 0).length;
    return { inStock, lowStock, outOfStock };
  }, [products]);

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        p.supplierName?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        p.projectName?.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchesCategory =
        selectedCategory === 'all' || p.categoryId.toString() === selectedCategory;

      const matchesSupplier =
        selectedSupplier === 'all' || p.supplierId.toString() === selectedSupplier;

      const matchesProject =
        selectedProject === 'all' ||
        (selectedProject === 'unassigned' ? !p.projectId : p.projectId?.toString() === selectedProject);

      const matchesStock =
        selectedStockStatus === 'all' ||
        (selectedStockStatus === 'in_stock' && p.quantity > 15) ||
        (selectedStockStatus === 'low_stock' && p.quantity > 0 && p.quantity <= 15) ||
        (selectedStockStatus === 'out_of_stock' && p.quantity === 0);

      return matchesSearch && matchesCategory && matchesSupplier && matchesProject && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, selectedSupplier, selectedProject, selectedStockStatus]);

  // Sort Logic
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'id') {
        comparison = a.productId - b.productId;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'quantity') {
        comparison = a.quantity - b.quantity;
      } else if (sortBy === 'valuation') {
        comparison = (a.price * a.quantity) - (b.price * b.quantity);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredProducts, sortBy, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const toggleSort = (field: 'name' | 'price' | 'quantity' | 'id' | 'valuation') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatPrice = (price: number) => {
    return `PKR ${price.toLocaleString('en-PK', {
      minimumFractionDigits: price % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'all' ||
    selectedSupplier !== 'all' ||
    selectedProject !== 'all' ||
    selectedStockStatus !== 'all';

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedSupplier('all');
    setSelectedProject('all');
    setSelectedStockStatus('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* 1. Enhanced Toolbar with Multi-tier Filters */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5">
        {/* Row 1: Search, Stock Pills, and View Switcher */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search materials by name, category, vendor, site..."
              className="w-full pl-10 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Stock Status Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
              <button
                onClick={() => {
                  setSelectedStockStatus('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedStockStatus === 'all'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => {
                  setSelectedStockStatus('in_stock');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedStockStatus === 'in_stock'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>In Stock ({stockCounts.inStock})</span>
              </button>
              <button
                onClick={() => {
                  setSelectedStockStatus('low_stock');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedStockStatus === 'low_stock'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Low Stock ({stockCounts.lowStock})</span>
              </button>
              {stockCounts.outOfStock > 0 && (
                <button
                  onClick={() => {
                    setSelectedStockStatus('out_of_stock');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    selectedStockStatus === 'out_of_stock'
                      ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Out ({stockCounts.outOfStock})</span>
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/80">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Dimensional Filters (Project, Category, Supplier) & Clear */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider shrink-0">
            <Filter className="w-3 h-3 text-blue-500" />
            <span>Scope By:</span>
          </div>

          {/* Project Filter (Admin Only) */}
          {isAdmin && projects.length > 0 && (
            <div className="relative">
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-3 pr-8 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">🏢 All Construction Sites ({projects.length})</option>
                {projects.map((proj) => (
                  <option key={proj.projectId} value={proj.projectId.toString()}>
                    {proj.code ? `[${proj.code}] ` : ''}{proj.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-3 pr-8 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">🏷️ All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId.toString()}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          <div className="relative">
            <select
              value={selectedSupplier}
              onChange={(e) => {
                setSelectedSupplier(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-3 pr-8 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">🚚 All Vendors ({suppliers.length})</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id.toString()}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Shortcut */}
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 font-bold transition-all flex items-center gap-1 shrink-0 ml-auto"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Content Rendering: Table or Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {hasActiveFilters ? 'No Matching Materials Found' : 'No Construction Materials Registered Yet'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {hasActiveFilters
              ? 'Try adjusting your search query, category, or site filters to view available warehouse items.'
              : 'Add your first construction material (e.g. Portland Cement, Deformed Steel Rebars) to begin tracking.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[960px] border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px] font-extrabold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th
                    onClick={() => toggleSort('id')}
                    className="py-3.5 px-3.5 cursor-pointer hover:text-blue-600 dark:hover:text-white whitespace-nowrap w-16"
                  >
                    <div className="flex items-center gap-1">
                      <span>ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('name')}
                    className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-white min-w-[200px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Material / Item</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 whitespace-nowrap text-center w-24">Slip Image</th>
                  {isAdmin && <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">Site / Project</th>}
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">Category</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">Supplier Vendor</th>
                  <th
                    onClick={() => toggleSort('price')}
                    className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-white whitespace-nowrap min-w-[110px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Unit Rate</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('quantity')}
                    className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-white whitespace-nowrap min-w-[130px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Stock Level</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('valuation')}
                    className="py-3.5 px-4 cursor-pointer hover:text-blue-600 dark:hover:text-white whitespace-nowrap min-w-[130px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Total Value (PKR)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[100px]">Status</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {paginatedProducts.map((product) => {
                  const lineValuation = (product.price || 0) * (product.quantity || 0);

                  return (
                    <tr
                      key={product.productId}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-3 px-3.5 font-mono text-slate-500 dark:text-slate-400 text-xs font-bold whitespace-nowrap">
                        #{product.productId}
                      </td>

                      {/* Material Title & Description */}
                      <td className="py-3 px-4 max-w-xs">
                        <p
                          onClick={() => onViewProduct(product)}
                          className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-1"
                        >
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-1 mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </td>

                      {/* Delivery Slip Thumbnail / Button */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        {product.receiptSlipUrl ? (
                          <button
                            type="button"
                            onClick={() => onViewSlip(product.receiptSlipUrl!, product)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-bold transition-all shadow-xs group/slip cursor-pointer"
                            title="View Supplier Challan / Delivery Slip"
                          >
                            <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <FileImage className="w-3 h-3" />
                            </div>
                            <span>Slip</span>
                            <ZoomIn className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover/slip:scale-110 transition-transform" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                            No Slip
                          </span>
                        )}
                      </td>

                      {/* Project / Site (Admin Only) */}
                      {isAdmin && (
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-[11px] font-bold max-w-[150px] truncate">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{product.projectName || 'General'}</span>
                          </span>
                        </td>
                      )}

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-[11px] font-semibold max-w-[160px] truncate">
                          <Tags className="w-3 h-3 shrink-0" />
                          <span className="truncate">{product.categoryName || 'General'}</span>
                        </span>
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-slate-700 dark:text-slate-300 text-xs font-medium max-w-[160px] truncate flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{product.supplierName || 'Unknown Vendor'}</span>
                        </span>
                      </td>

                      {/* Unit Rate (PKR) */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 text-xs whitespace-nowrap">
                        {formatPrice(product.price)}
                      </td>

                      {/* Stock Level with Stepper */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <button
                            onClick={() => handleStockAdjust(product, -1)}
                            disabled={product.quantity <= 0}
                            title="Subtract 1 unit"
                            className="p-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="min-w-[60px] text-center font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                            {product.quantity.toLocaleString()}{' '}
                            <span className="text-[10px] text-slate-500 font-sans font-normal">
                              {product.unit || 'Units'}
                            </span>
                          </span>
                          <button
                            onClick={() => handleStockAdjust(product, 1)}
                            title="Add 1 unit"
                            className="p-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>

                      {/* Line Total Valuation */}
                      <td className="py-3 px-4 font-mono font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                        <span className="text-[10px] text-emerald-600 font-bold mr-1">PKR</span>
                        {lineValuation.toLocaleString('en-PK')}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StockBadge quantity={product.quantity} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewProduct(product)}
                            title="View Material Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditProduct(product)}
                            title="Edit Material"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product)}
                            title="Delete Material"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
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
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedProducts.map((product) => {
            const lineValuation = (product.price || 0) * (product.quantity || 0);

            return (
              <div
                key={product.productId}
                className="glass-card rounded-3xl p-5 flex flex-col justify-between border border-slate-200/90 dark:border-slate-800 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 group interactive-card"
              >
                <div>
                  {/* Top Bar: ID, Status, Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        #{product.productId}
                      </span>
                      <StockBadge quantity={product.quantity} />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onViewProduct(product)}
                        title="View Details"
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditProduct(product)}
                        title="Edit Material"
                        className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product)}
                        title="Delete Material"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4
                    onClick={() => onViewProduct(product)}
                    className="font-extrabold text-slate-900 dark:text-slate-100 text-base mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    {product.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3.5 leading-relaxed">
                    {product.description || 'Standard construction inventory item.'}
                  </p>

                  {/* Badges: Project, Category, Vendor */}
                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    {isAdmin && product.projectName && (
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/20 font-bold flex items-center gap-1">
                        <Building2 className="w-2.5 h-2.5" />
                        <span>{product.projectName}</span>
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/20 font-semibold flex items-center gap-1">
                      <Tags className="w-2.5 h-2.5" />
                      <span>{product.categoryName || 'General'}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                      <Truck className="w-2.5 h-2.5" />
                      <span>{product.supplierName || 'Vendor'}</span>
                    </span>
                  </div>

                  {/* Delivery Slip Preview Card (if uploaded) */}
                  {product.receiptSlipUrl && (
                    <div
                      onClick={() => onViewSlip(product.receiptSlipUrl!, product)}
                      className="mb-3.5 p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 flex items-center justify-between cursor-pointer hover:border-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-500/20 transition-all group/slip"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <FileImage className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200 leading-tight">
                            Supplier Challan Slip
                          </p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Click to view verified invoice
                          </p>
                        </div>
                      </div>
                      <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 group-hover/slip:scale-110 transition-transform">
                        <ZoomIn className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  {/* Stock Level Stepper */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 mb-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Warehouse Stock</span>
                      <p className="text-sm font-extrabold font-mono text-slate-900 dark:text-slate-100">
                        {product.quantity.toLocaleString()} <span className="text-xs font-normal text-slate-400 font-sans">{product.unit || 'Units'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => handleStockAdjust(product, -1)}
                        disabled={product.quantity <= 0}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-colors cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => handleStockAdjust(product, 1)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Financial Valuation Row */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Unit Rate</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Line Valuation</span>
                    <span className="text-sm font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      PKR {lineValuation.toLocaleString('en-PK')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 pt-2 gap-3 text-xs text-slate-500 font-medium">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} materials
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
