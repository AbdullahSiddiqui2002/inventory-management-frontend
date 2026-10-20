'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Category } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { Tags, Sparkles, Check, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToEdit?: Category | null;
}

const COMMON_CONSTRUCTION_CATEGORIES = [
  'Scaffolding & Shuttering Systems',
  'Waterproofing & Bituminous Membranes',
  'HVAC, Ventilation & Ducting',
  'Hardware, Fasteners & Fixtures',
  'Safety, PPE & Site Signage',
  'Glass, Aluminum & Curtain Glazing',
];

export const CategoryFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
}) => {
  const { success, error } = useNotification();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
    } else {
      setName('');
    }
  }, [categoryToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Validation Error', 'Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (categoryToEdit) {
        await apiService.updateCategory(categoryToEdit.categoryId, {
          categoryId: categoryToEdit.categoryId,
          name: name.trim(),
        });
        success('Category Updated', `Updated "${name.trim()}".`);
      } else {
        await apiService.createCategory({ name: name.trim() });
        success('Category Created', `Created "${name.trim()}".`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      error(categoryToEdit ? 'Update Failed' : 'Creation Failed', parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Edit Material Category' : 'Create Material Category'}
      subtitle={
        categoryToEdit
          ? `Modify configuration for category ID #${categoryToEdit.categoryId}`
          : 'Define a standardized construction BOM category for procurement'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Category Name *</span>
            {categoryToEdit && (
              <span className="font-mono text-[10px] text-slate-400">
                ID #{categoryToEdit.categoryId}
              </span>
            )}
          </label>
          <div className="relative">
            <Tags className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Scaffolding & Formwork Systems"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />
          </div>
        </div>

        {/* Suggested Quick Categories */}
        {!categoryToEdit && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>Suggested Construction Taxonomies:</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CONSTRUCTION_CATEGORIES.map((catName) => (
                <button
                  key={catName}
                  type="button"
                  onClick={() => setName(catName)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all font-medium"
                >
                  + {catName}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{categoryToEdit ? 'Save Changes' : 'Create Category'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
