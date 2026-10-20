'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Supplier } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { SupplierList } from '@/components/suppliers/SupplierList';
import { SupplierFormModal } from '@/components/suppliers/SupplierFormModal';
import { SupplierBulkUploadModal } from '@/components/suppliers/SupplierBulkUploadModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Truck, RotateCw, Building2 } from 'lucide-react';

export default function SuppliersPage() {
  const { user, isSupervisor, activeProjectId } = useAuth();
  const { success, error } = useNotification();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSuppliers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getSuppliers(activeProjectId);
      setSuppliers(data);
    } catch (err) {
      error('Failed to load suppliers', parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, error]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleOpenAdd = () => {
    setSelectedSupplier(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSupplier) return;
    setIsDeleting(true);
    try {
      await apiService.deleteSupplier(selectedSupplier.id);
      success('Supplier Deleted', `Deleted "${selectedSupplier.name}".`);
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
      loadSuppliers();
    } catch (err) {
      error('Delete Failed', parseErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isSupervisor ? 'Site Vendors & Suppliers' : 'Suppliers & Vendors Directory'}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {isSupervisor ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-bold flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>Site: {user?.assignedProjectName || 'Assigned Site'}</span>
                  </span>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Manage construction material vendors ({suppliers.length} active suppliers)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={loadSuppliers}
          disabled={isLoading}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors self-end sm:self-auto"
          title="Refresh"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
        </button>
      </div>

      {/* Supplier List */}
      <SupplierList
        suppliers={suppliers}
        onAddNew={handleOpenAdd}
        onBulkAdd={() => setIsBulkModalOpen(true)}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Add / Edit Supplier Modal */}
      <SupplierFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={loadSuppliers}
        supplierToEdit={selectedSupplier}
      />

      {/* Bulk Upload Modal */}
      <SupplierBulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={loadSuppliers}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier"
        message={`Are you sure you want to delete supplier "${selectedSupplier?.name}"? Associated materials may be affected.`}
        confirmText="Delete Supplier"
        isLoading={isDeleting}
      />
    </div>
  );
}
