'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, Category, Supplier, Project } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { ProductBulkUploadModal } from '@/components/products/ProductBulkUploadModal';
import { ProductDetailModal } from '@/components/products/ProductDetailModal';
import { SlipLightboxModal } from '@/components/common/SlipLightboxModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import {
  Package,
  Plus,
  UploadCloud,
  RotateCw,
  Building2,
  HardHat,
  ShieldCheck,
  Coins,
  Boxes,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

export default function ProductsPage() {
  const { user, isAdmin, isSupervisor, activeProjectId } = useAuth();
  const { success, error } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxSlipUrl, setLightboxSlipUrl] = useState('');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prodData, catData, supData, projData] = await Promise.all([
        apiService.getProducts(activeProjectId),
        apiService.getCategories(activeProjectId),
        apiService.getSuppliers(activeProjectId),
        isAdmin ? apiService.getProjects() : Promise.resolve([]),
      ]);
      setProducts(prodData);
      setCategories(catData);
      setSuppliers(supData);
      setProjects(projData);
    } catch (err) {
      error('Failed to load materials', parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, isAdmin, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleViewSlip = (slipUrl: string, product: Product) => {
    setSelectedProduct(product);
    setLightboxSlipUrl(slipUrl);
    setIsLightboxOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    setIsDeleting(true);
    try {
      await apiService.deleteProduct(selectedProduct.productId);
      success('Material Deleted', `Deleted "${selectedProduct.name}".`);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      loadData();
    } catch (err) {
      error('Delete Failed', parseErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Compact Currency Formatter for clean display without truncation
  const formatValuation = (amount: number) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    return amount.toLocaleString('en-PK');
  };

  // Aggregated Inventory KPIs
  const inventoryMetrics = useMemo(() => {
    const totalMaterials = products.length;
    const totalUnits = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalValuation = products.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0);
    const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= 15).length;
    const outOfStockCount = products.filter((p) => p.quantity <= 0).length;

    return {
      totalMaterials,
      totalUnits,
      totalValuation,
      lowStockCount,
      outOfStockCount,
      totalCategories: categories.length,
      totalSuppliers: suppliers.length,
    };
  }, [products, categories, suppliers]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Executive Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-indigo-600/10 dark:from-blue-900/40 dark:via-cyan-900/30 dark:to-indigo-900/30 border border-blue-200/80 dark:border-blue-500/20 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Ambient Glow Accent */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        {/* Banner Details */}
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold shadow-xs">
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <HardHat className="w-3.5 h-3.5" />}
              <span>
                {isAdmin
                  ? 'Central Warehouse Ledger — Multi-Project Oversight'
                  : `Site Warehouse: ${user?.assignedProjectName || 'Assigned Site'}`}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{products.length} Material SKUs Active</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isSupervisor ? 'Site Materials & Delivery Slips' : 'Construction Materials Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {isAdmin
              ? 'Complete multi-site warehouse inventory. Track cement bags, steel rebars, supplier delivery invoices, and unit rates across Pakistan.'
              : `Managing materials stock and supplier challan slips for ${user?.assignedProjectName || 'this site'}.`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="h-10 w-10 rounded-2xl bg-white/95 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 cursor-pointer group"
            title="Refresh Inventory Data"
          >
            <RotateCw
              className={`w-4 h-4 transition-transform duration-500 ${
                isLoading
                  ? 'animate-spin text-blue-600 dark:text-blue-400'
                  : 'group-hover:rotate-180 text-slate-600 dark:text-slate-300'
              }`}
            />
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="h-10 px-3.5 rounded-2xl bg-white/95 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="h-10 px-4 rounded-2xl btn-primary-glow text-xs font-bold flex items-center gap-2 active:scale-95 shrink-0 cursor-pointer group shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Inventory KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Materials / SKUs */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Materials
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {inventoryMetrics.totalMaterials}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across {inventoryMetrics.totalCategories} categories & {inventoryMetrics.totalSuppliers} vendors
          </p>
        </div>

        {/* KPI 2: Total Inventory Valuation */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stock Valuation
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0" title={`PKR ${inventoryMetrics.totalValuation.toLocaleString('en-PK')}`}>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">PKR</span>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatValuation(inventoryMetrics.totalValuation)}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Total capital recorded in site materials
          </p>
        </div>

        {/* KPI 3: Total Recorded Units */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Units in Warehouse
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {inventoryMetrics.totalUnits.toLocaleString('en-PK')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bags, Tons, Sheets, Pieces & Packs
          </p>
        </div>

        {/* KPI 4: Low Stock Restock Alerts */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stock Health
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {inventoryMetrics.lowStockCount + inventoryMetrics.outOfStockCount}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {inventoryMetrics.outOfStockCount > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                🚨 {inventoryMetrics.outOfStockCount} Out of stock
              </span>
            ) : inventoryMetrics.lowStockCount > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                ⚠️ {inventoryMetrics.lowStockCount} Items low stock
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ All inventory optimal
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 3. Main Materials Table & Grid */}
      <ProductTable
        products={products}
        categories={categories}
        suppliers={suppliers}
        projects={projects}
        onRefresh={loadData}
        onViewProduct={handleOpenDetail}
        onEditProduct={handleOpenEdit}
        onDeleteProduct={handleOpenDelete}
        onViewSlip={handleViewSlip}
      />

      {/* Form Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={loadData}
        productToEdit={selectedProduct}
        categories={categories}
        suppliers={suppliers}
        projects={projects}
      />

      {/* Bulk Upload Modal */}
      <ProductBulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={loadData}
        categories={categories}
        suppliers={suppliers}
      />

      {/* Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={selectedProduct}
        onViewSlip={handleViewSlip}
        onEdit={(prod) => {
          setSelectedProduct(prod);
          setIsFormModalOpen(true);
        }}
      />

      {/* Cloudinary Supplier Slip Lightbox */}
      <SlipLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageUrl={lightboxSlipUrl}
        materialName={selectedProduct?.name}
        supplierName={selectedProduct?.supplierName}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Material Entry"
        message={`Are you sure you want to permanently delete "${selectedProduct?.name}" (ID #${selectedProduct?.productId})? This action cannot be undone.`}
        confirmText="Delete Material"
        isLoading={isDeleting}
      />
    </div>
  );
}
