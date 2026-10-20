'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Supplier } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplierToEdit?: Supplier | null;
}

export const SupplierFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  supplierToEdit,
}) => {
  const { success, error } = useNotification();
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    address: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (supplierToEdit) {
      setFormData({
        id: supplierToEdit.id,
        name: supplierToEdit.name,
        address: supplierToEdit.address,
        phone: supplierToEdit.phone,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
      });
    }
  }, [supplierToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      error('Validation Error', 'Supplier name is required.');
      return;
    }
    if (!formData.phone?.trim()) {
      error('Validation Error', 'Phone number is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (supplierToEdit) {
        await apiService.updateSupplier(supplierToEdit.id, formData);
        success('Supplier Updated', `Updated "${formData.name}".`);
      } else {
        await apiService.createSupplier(formData);
        success('Supplier Created', `Created "${formData.name}".`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      error(supplierToEdit ? 'Update Failed' : 'Creation Failed', parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplierToEdit ? 'Edit Supplier' : 'Add New Supplier'}
      subtitle={supplierToEdit ? `Updating ID #${supplierToEdit.id}` : 'Register a new supplier or vendor'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Supplier / Company Name *
          </label>
          <input
            type="text"
            required
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Samsung Electronics"
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Phone Number *
          </label>
          <input
            type="text"
            required
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="e.g. +1-800-726-7864"
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            HQ Address / Location
          </label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. 1321 Upland Dr, Houston, TX 77043"
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {supplierToEdit ? 'Save Changes' : 'Create Supplier'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
