'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { StockBadge } from '@/components/common/Badge';
import { RestockModal } from '@/components/inventory/RestockModal';
import {
  AlertTriangle,
  RotateCw,
  PlusCircle,
  Download,
  Search,
  PackageCheck,
  Minus,
  Truck,
  Building2,
} from 'lucide-react';

export default function InventoryAlertsPage() {
  const { user, isSupervisor, activeProjectId } = useAuth();
  const { success, error } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all_alerts' | 'out_of_stock' | 'low_stock'>('all_alerts');
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getProducts(activeProjectId);
      setProducts(data);
    } catch (err) {
      error('Failed to load alert items', parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter low stock items
  const alertProducts = useMemo(() => {
    return products
      .filter((p) => {
        const isLow = p.quantity <= 10;
        if (!isLow) return false;

        if (filterType === 'out_of_stock') return p.quantity <= 0;
        if (filterType === 'low_stock') return p.quantity > 0 && p.quantity <= 10;
        return true;
      })
      .filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.quantity - b.quantity);
  }, [products, filterType, searchTerm]);

  // Quick adjust
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
      success('Stock Updated', `"${product.name}" stock updated to ${newQuantity} ${product.unit}.`);
      loadData();
    } catch (err) {
      error('Update Failed', parseErrorMessage(err));
    }
  };

  // Export Procurement List to CSV
  const handleExportCsv = () => {
    if (alertProducts.length === 0) return;

    const headers = 'ProductId,Name,CurrentQuantity,Unit,Price,Category,Supplier,Site';
    const rows = alertProducts.map(
      (p) =>
        `"${p.productId}","${p.name}",${p.quantity},"${p.unit || 'Units'}",${p.price},"${p.categoryName || ''}","${p.supplierName || ''}","${p.projectName || ''}"`
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `procurement_order_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Exported', 'Procurement purchase order downloaded.');
  };

  const outOfStockCount = products.filter((p) => p.quantity <= 0).length;
  const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= 10).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-600/10 via-slate-100 to-slate-100 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border border-amber-200 dark:border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs font-semibold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Site Material Replenishment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isSupervisor ? `${user?.assignedProjectName || 'Site'} Material Alerts` : 'Construction Low Stock & Replenishment'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
            {outOfStockCount + lowStockCount} construction materials require immediate purchase orders (&le; 10 units).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
            title="Refresh"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={alertProducts.length === 0}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export Purchase Order</span>
          </button>

          <button
            onClick={() => setIsRestockModalOpen(true)}
            disabled={alertProducts.length === 0}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Batch Restock All</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search low-stock materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs sm:text-sm font-medium"
          />
        </div>

        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-1">
          <button
            onClick={() => setFilterType('all_alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'all_alerts'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Alerts ({outOfStockCount + lowStockCount})
          </button>
          <button
            onClick={() => setFilterType('out_of_stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'out_of_stock'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
          <button
            onClick={() => setFilterType('low_stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'low_stock'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
        </div>
      </div>

      {/* Alerts Table */}
      {alertProducts.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <PackageCheck className="w-16 h-16 text-emerald-500 mb-3 opacity-70" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Material Stock Levels Optimal</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            All construction materials are currently above the safety threshold.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Material ID</th>
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">Site / Project</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Rate</th>
                  <th className="py-3.5 px-4">Remaining</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {alertProducts.map((product) => (
                  <tr key={product.productId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 text-xs font-semibold">
                      #{product.productId}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      {product.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-xs font-semibold">
                        <Building2 className="w-3 h-3" />
                        <span>{product.projectName || 'Site'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 text-xs font-medium truncate max-w-[140px]">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>{product.supplierName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium">
                        {product.categoryName || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {product.quantity} <span className="text-[10px] text-slate-500">{product.unit || 'Units'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StockBadge quantity={product.quantity} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStockAdjust(product, -1)}
                          disabled={product.quantity <= 0}
                          className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent disabled:opacity-30"
                          title="Reduce"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleStockAdjust(product, 5)}
                          className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold transition-colors"
                          title="Add 5 units"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleStockAdjust(product, 20)}
                          className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-100 dark:hover:bg-blue-500/25 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-xs font-bold transition-colors"
                          title="Add 20 units"
                        >
                          +20
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        onSuccess={loadData}
        lowStockProducts={alertProducts}
      />
    </div>
  );
}
