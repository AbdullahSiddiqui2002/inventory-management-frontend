'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Product, ProductDto, Category, Supplier, Project } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { SlipUploader } from '../common/SlipUploader';
import { Package, Building2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  projects?: Project[];
}

const COMMON_CONSTRUCTION_UNITS = [
  'Bags',
  'Tons',
  'Trucks / Dumpers',
  'Pieces / Bricks',
  'Lengths / Pipes',
  'Sq Meters',
  'Sq Feet',
  'Drums / Buckets',
  'Coils',
  'Sets',
  'Units',
];

export const ProductFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  productToEdit,
  categories,
  suppliers,
  projects = [],
}) => {
  const { user, isAdmin, isSupervisor } = useAuth();
  const { success, error } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultProjectId = isSupervisor
    ? user?.assignedProjectId ?? null
    : projects[0]?.projectId ?? null;

  const [formData, setFormData] = useState<ProductDto>({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    unit: 'Bags',
    receiptSlipUrl: '',
    categoryId: categories[0]?.categoryId || 0,
    supplierId: suppliers[0]?.id || 0,
    projectId: defaultProjectId,
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        productId: productToEdit.productId,
        name: productToEdit.name,
        description: productToEdit.description || '',
        price: productToEdit.price,
        quantity: productToEdit.quantity,
        unit: productToEdit.unit || 'Units',
        receiptSlipUrl: productToEdit.receiptSlipUrl || '',
        categoryId: productToEdit.categoryId,
        supplierId: productToEdit.supplierId,
        projectId: productToEdit.projectId || defaultProjectId,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        quantity: 0,
        unit: 'Bags',
        receiptSlipUrl: '',
        categoryId: categories[0]?.categoryId || 1,
        supplierId: suppliers[0]?.id || 1,
        projectId: defaultProjectId,
      });
    }
  }, [productToEdit, categories, suppliers, isOpen, defaultProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('Validation Error', 'Material name is required.');
      return;
    }
    if (formData.price < 0) {
      error('Validation Error', 'Unit price cannot be negative.');
      return;
    }
    if (formData.quantity < 0) {
      error('Validation Error', 'Quantity cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (productToEdit) {
        await apiService.updateProduct(productToEdit.productId, formData);
        success('Material Updated', `Updated "${formData.name}".`);
      } else {
        await apiService.createProduct(formData);
        success('Material Added', `Added "${formData.name}" to site inventory.`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      error(productToEdit ? 'Update Failed' : 'Creation Failed', parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Construction Material' : 'Add Material / Stock Entry'}
      subtitle={
        productToEdit
          ? `Updating ID #${productToEdit.productId}`
          : isSupervisor
          ? `Adding to Site: ${user?.assignedProjectName || 'Assigned Project'}`
          : 'Record material arrival and attach supplier receipt slip'
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Selector (for Admin only; Supervisors are locked to their site) */}
        {isAdmin && projects.length > 0 && (
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20">
            <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>Target Construction Project</span>
            </label>
            <select
              value={formData.projectId ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, projectId: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            >
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  [{p.code}] {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Material Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Material / Item Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Lucky Portland Cement 50kg Bags"
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-medium"
          />
        </div>

        {/* Category & Supplier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Material Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
            >
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Vendor / Supplier *
            </label>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price, Quantity, Unit Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Unit Cost / Rate ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Received Quantity *
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Measurement Unit *
            </label>
            <input
              type="text"
              list="units-list"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="Bags, Tons..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-medium"
            />
            <datalist id="units-list">
              {COMMON_CONSTRUCTION_UNITS.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Cloudinary Supplier Slip Photo Upload */}
        <SlipUploader
          value={formData.receiptSlipUrl}
          onChange={(url) => setFormData({ ...formData, receiptSlipUrl: url })}
        />

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Specifications / Delivery Challan Notes
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Challan #, truck vehicle number, gate pass notes..."
            className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Form Actions */}
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
            <Package className="w-4 h-4" />
            <span>{productToEdit ? 'Save Changes' : 'Record Material'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
