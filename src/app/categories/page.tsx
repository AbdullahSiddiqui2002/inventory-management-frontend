'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Category, Product } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { CategoryList } from '@/components/categories/CategoryList';
import { CategoryFormModal } from '@/components/categories/CategoryFormModal';
import { CategoryBulkUploadModal } from '@/components/categories/CategoryBulkUploadModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import {
  Tags,
  RotateCw,
  Building2,
  Boxes,
  Coins,
  TrendingUp,
  Plus,
  Layers,
  ShieldCheck,
  Package,
} from 'lucide-react';

export default function CategoriesPage() {
  const { user, isSupervisor, activeProjectId } = useAuth();
  const { success, error } = useNotification();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catData, prodData] = await Promise.all([
        apiService.getCategories(activeProjectId),
        apiService.getProducts(activeProjectId),
      ]);

      // Ensure every category has products mapped
      const enrichedCategories = catData.map((cat) => {
        const catProducts =
          cat.products && cat.products.length > 0
            ? cat.products
            : prodData.filter((p) => p.categoryId === cat.categoryId);
        return {
          ...cat,
          products: catProducts,
        };
      });

      setCategories(enrichedCategories);
      setProducts(prodData);
    } catch (err) {
      error('Failed to load categories', parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;
    setIsDeleting(true);
    try {
      await apiService.deleteCategory(selectedCategory.categoryId);
      success('Category Deleted', `Deleted "${selectedCategory.name}".`);
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      loadData();
    } catch (err) {
      error('Delete Failed', parseErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Compact Pakistani Rupee valuation formatter
  const formatValuation = (amount: number) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    return amount.toLocaleString('en-PK');
  };

  // Aggregated KPIs
  const metrics = useMemo(() => {
    const totalCategories = categories.length;
    const totalSkus = categories.reduce((acc, c) => acc + (c.products?.length || 0), 0);
    const totalUnits = categories.reduce(
      (acc, c) => acc + (c.products?.reduce((s, p) => s + (p.quantity || 0), 0) || 0),
      0
    );
    const totalValuation = categories.reduce(
      (acc, c) =>
        acc +
        (c.products?.reduce((s, p) => s + (p.price || 0) * (p.quantity || 0), 0) || 0),
      0
    );

    // Find category with highest stock units
    let topCat: Category | null = null;
    let maxUnits = -1;
    categories.forEach((c) => {
      const units = c.products?.reduce((s, p) => s + (p.quantity || 0), 0) || 0;
      if (units > maxUnits) {
        maxUnits = units;
        topCat = c;
      }
    });

    return {
      totalCategories,
      totalSkus,
      totalUnits,
      totalValuation,
      topCat,
      topCatUnits: Math.max(0, maxUnits),
    };
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* Executive Ambient Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/80 shadow-2xl p-6 sm:p-8 text-white">
        {/* Glow backdrop with isolated overflow */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                <Tags className="w-3.5 h-3.5 text-blue-400" />
                <span>BOM Master Classification</span>
              </span>
              {isSupervisor ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Site: {user?.assignedProjectName || 'Assigned Site'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>HQ Enterprise Scope</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/90 text-slate-300 border border-slate-700/80">
                {categories.length} Taxonomies Configured
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/10">
                  <Tags className="w-6 h-6" />
                </div>
                <span>{isSupervisor ? 'Site Material Categories' : 'Material Classifications & Categories'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
                Standardized construction bill of materials (BOM). Manage structural rebars, cement, sanitaryware, and finishing categories with real-time stock valuation.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/80 transition-all shadow-sm flex items-center justify-center"
              title="Refresh Categories"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700/90 hover:border-slate-600 text-xs font-semibold transition-all shadow-sm flex items-center gap-2 hover:text-white"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Bulk Add</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center gap-2 transform active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Categories */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Categories</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <Tags className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.totalCategories}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Groups</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">100%</span> Active procurement taxonomy
          </p>
        </div>

        {/* Card 2: Tracked SKUs */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Associated SKUs</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.totalSkus}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Materials</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Catalogued materials in warehouse
          </p>
        </div>

        {/* Card 3: Total Category Valuation */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Stock Valuation</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5" title={`Exact: PKR ${metrics.totalValuation.toLocaleString('en-PK')}`}>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">PKR</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {formatValuation(metrics.totalValuation)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            BOM inventory asset value
          </p>
        </div>

        {/* Card 4: Most Stocked Category */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Leading Volume</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 truncate" title={metrics.topCat?.name || 'None'}>
            <span className="text-lg font-black text-slate-900 dark:text-white block truncate">
              {metrics.topCat?.name || 'None'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{metrics.topCatUnits.toLocaleString('en-PK')} Units</span> in stock
          </p>
        </div>
      </div>

      {/* Categories Content List with Grid & Dense Table views */}
      <CategoryList
        categories={categories}
        onAddNew={handleOpenAdd}
        onBulkAdd={() => setIsBulkModalOpen(true)}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Add / Edit Category Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={loadData}
        categoryToEdit={selectedCategory}
      />

      {/* Bulk Upload Modal */}
      <CategoryBulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${selectedCategory?.name}"? Any materials assigned to this category might be affected.`}
        confirmText="Delete Category"
        isLoading={isDeleting}
      />
    </div>
  );
}
