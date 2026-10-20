'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Product, Category, Supplier, Project } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/common/StatCard';
import { CategoryDistributionChart } from '@/components/dashboard/CategoryDistributionChart';
import { SupplierValuationChart } from '@/components/dashboard/SupplierValuationChart';
import { LowStockAlerts } from '@/components/dashboard/LowStockAlerts';
import { RecentProductsTable } from '@/components/dashboard/RecentProductsTable';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { RestockModal } from '@/components/inventory/RestockModal';
import { SiteFilterDropdown } from '@/components/dashboard/SiteFilterDropdown';
import {
  Building2,
  Package,
  DollarSign,
  AlertTriangle,
  Truck,
  Plus,
  RotateCw,
  HardHat,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Filter,
  ChevronDown,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAdmin, activeProjectId, setSelectedAdminProjectId } = useAuth();
  const { error } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [siteFilter, setSiteFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
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
      error('Failed to load dashboard metrics', parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, isAdmin, error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter products by selected site if filtered on dashboard
  const displayedProducts = useMemo(() => {
    if (siteFilter === 'all') return products;
    return products.filter((p) => p.projectId?.toString() === siteFilter);
  }, [products, siteFilter]);

  // Compute metrics dynamically based on active filter
  const stats = useMemo(() => {
    const totalProducts = displayedProducts.length;
    const totalQuantity = displayedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalValuation = displayedProducts.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 0), 0);
    const lowStockCount = displayedProducts.filter((p) => p.quantity > 0 && p.quantity <= 15).length;
    const outOfStockCount = displayedProducts.filter((p) => p.quantity <= 0).length;

    return {
      totalProjects: projects.length,
      totalProducts,
      totalQuantity,
      totalValuation,
      lowStockCount,
      outOfStockCount,
      totalCategories: categories.length,
      totalSuppliers: suppliers.length,
    };
  }, [displayedProducts, categories, suppliers, projects]);

  const lowStockItems = displayedProducts.filter((p) => p.quantity <= 15);

  const formatBudget = (budget: number) => {
    if (budget >= 10000000) {
      return `PKR ${(budget / 10000000).toFixed(1)} Cr`;
    }
    if (budget >= 1000000) {
      return `PKR ${(budget / 1000000).toFixed(1)}M`;
    }
    return `PKR ${budget.toLocaleString('en-PK')}`;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Executive Command Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-900/40 dark:via-indigo-900/30 dark:to-purple-900/30 border border-blue-200/80 dark:border-blue-500/20 relative z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Ambient glow accent (isolated in overflow-hidden sub-wrapper to prevent clipping dropdowns) */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold shadow-xs">
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <HardHat className="w-3.5 h-3.5" />}
              <span>
                {isAdmin
                  ? 'Owner Command Center — Multi-Project Oversight'
                  : `Site Incharge: ${user?.assignedProjectName || 'Assigned Site'}`}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Operations</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isAdmin ? 'Construction Multi-Project Dashboard' : `${user?.assignedProjectName || 'Site'} Inventory Portal`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {isAdmin
              ? `Tracking ${projects.length} active construction sites, field supervisors, concrete & steel inventory, and vendor expenditures across Pakistan.`
              : `Logged in as ${user?.fullName}. Managing cement, steel rebars, and supplier invoice slips for this site.`}
          </p>
        </div>

        {/* Action Controls & Scope Filter */}
        <div className="flex flex-wrap xl:flex-nowrap items-center gap-2.5 relative z-10 shrink-0">
          {/* Enhanced Custom Site Filter Dropdown */}
          {isAdmin && projects.length > 0 && (
            <SiteFilterDropdown
              projects={projects}
              selectedProjectId={siteFilter}
              onSelectProject={setSiteFilter}
            />
          )}

          {/* Refresh Button with Smooth Spin */}
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="h-10 w-10 rounded-2xl bg-white/95 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 cursor-pointer group"
            title="Refresh Real-time Data"
          >
            <RotateCw
              className={`w-4 h-4 transition-transform duration-500 ${
                isLoading
                  ? 'animate-spin text-blue-600 dark:text-blue-400'
                  : 'group-hover:rotate-180 text-slate-600 dark:text-slate-300'
              }`}
            />
          </button>

          {/* Restock Alerts Quick Button */}
          {lowStockItems.length > 0 && (
            <button
              onClick={() => setIsRestockModalOpen(true)}
              className="h-10 px-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/30 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-xs hover:shadow-md hover:shadow-amber-500/10 active:scale-95 shrink-0 cursor-pointer group whitespace-nowrap"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Restock ({lowStockItems.length})</span>
            </button>
          )}

          {/* Primary Add Material Button */}
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="h-10 px-4 rounded-2xl btn-primary-glow text-xs font-bold flex items-center gap-2 active:scale-95 shrink-0 cursor-pointer group whitespace-nowrap"
          >
            <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid with Hover Elevation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Material Valuation"
          value={`PKR ${stats.totalValuation.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subtitle={`${stats.totalQuantity.toLocaleString()} Total Units Recorded`}
          icon={DollarSign}
          gradient="from-blue-500/10 via-blue-500/5 to-transparent"
          iconColor="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20"
        />

        <StatCard
          title={isAdmin ? 'Active Sites' : 'Material Types'}
          value={isAdmin ? stats.totalProjects : stats.totalProducts}
          subtitle={isAdmin ? 'Ongoing Construction Sites' : `Across ${stats.totalCategories} site categories`}
          icon={isAdmin ? Building2 : Package}
          gradient="from-indigo-500/10 via-indigo-500/5 to-transparent"
          iconColor="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20"
        />

        <StatCard
          title="Critical Restock"
          value={stats.lowStockCount + stats.outOfStockCount}
          subtitle={`${stats.outOfStockCount} Out of stock, ${stats.lowStockCount} Low stock`}
          icon={AlertTriangle}
          gradient="from-amber-500/10 via-amber-500/5 to-transparent"
          iconColor="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
          trend={
            stats.lowStockCount > 0
              ? { value: `${stats.lowStockCount} Items Critical`, isPositive: false }
              : { value: 'Optimal Stock Level', isPositive: true }
          }
        />

        <StatCard
          title="Vendors & Categories"
          value={`${stats.totalSuppliers} / ${stats.totalCategories}`}
          subtitle="Registered Vendors & Categories"
          icon={Truck}
          gradient="from-purple-500/10 via-purple-500/5 to-transparent"
          iconColor="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20"
        />
      </div>

      {/* Admin Multi-Project Cards Overview */}
      {isAdmin && projects.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Active Construction Sites ({projects.length})</span>
            </h2>
            <Link
              href="/admin/projects"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group transition-colors"
            >
              <span>Manage All Sites</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 4-column balanced grid with Interactive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {projects.map((p) => {
              const projectMaterialsCount = products.filter((prod) => prod.projectId === p.projectId).length;
              return (
                <div
                  key={p.projectId}
                  className="glass-card interactive-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono text-[11px] font-extrabold border border-blue-200 dark:border-blue-500/20 group-hover:border-blue-400 transition-colors">
                        {p.code}
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{p.status}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{p.location || 'Location specified'}</span>
                    </p>

                    {/* Supervisor Pill */}
                    <div className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mb-3 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Site Incharge
                      </span>
                      {p.supervisorName ? (
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                          <HardHat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{p.supervisorName}</span>
                        </p>
                      ) : (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Allocated Budget</span>
                      <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                        {formatBudget(p.budget)}
                      </span>
                    </div>

                    <Link
                      href="/products"
                      onClick={() => setSelectedAdminProjectId(p.projectId)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 text-xs font-bold transition-all duration-200 flex items-center gap-1 shadow-xs active:scale-95 group/btn"
                    >
                      <span>{projectMaterialsCount} Items</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistributionChart categories={categories} products={displayedProducts} />
        <SupplierValuationChart suppliers={suppliers} products={displayedProducts} />
      </div>

      {/* Tables & Live Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockAlerts
          products={displayedProducts}
          onQuickRestock={() => setIsRestockModalOpen(true)}
        />
        <RecentProductsTable products={displayedProducts} />
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={fetchData}
        categories={categories}
        suppliers={suppliers}
        projects={projects}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        onSuccess={fetchData}
        lowStockProducts={lowStockItems}
      />
    </div>
  );
}
