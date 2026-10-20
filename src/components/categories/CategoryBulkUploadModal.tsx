'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { Layers, Check, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_TEMPLATE = [
  'Ready-Mix Concrete & Admixtures',
  'Scaffolding & Formwork Systems',
  'Waterproofing & Bituminous Membranes',
  'HVAC Ducting & Ventilation Units',
  'Ceramic Tiles & Sanitaryware',
  'Structural Steel & Iron Sections',
].join('\n');

export const CategoryBulkUploadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useNotification();
  const [namesText, setNamesText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rawNames = namesText
    .split('\n')
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  const handleSubmit = async () => {
    if (rawNames.length === 0) {
      error('Empty Input', 'Please enter at least one category name.');
      return;
    }

    const payload = rawNames.map((name) => ({ name }));

    setIsSubmitting(true);
    try {
      await apiService.createCategoriesBulk(payload);
      success('Bulk Upload Completed', `Successfully added ${rawNames.length} categories.`);
      setNamesText('');
      onSuccess();
      onClose();
    } catch (err) {
      error('Bulk Upload Failed', parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadSample = () => {
    setNamesText(SAMPLE_TEMPLATE);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Add Material Categories"
      subtitle="Paste multiple construction BOM categories (one per line)"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Category Names (One per line)
            </label>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Load Sample Template</span>
            </button>
          </div>

          <textarea
            rows={7}
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            placeholder={`Ready-Mix Concrete & Admixtures\nScaffolding & Formwork Systems\nWaterproofing & Bituminous Membranes\nHVAC Ducting & Ventilation Units`}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input font-mono text-xs sm:text-sm leading-relaxed border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20"
          />

          <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {rawNames.length > 0 ? (
                <strong className="text-blue-600 dark:text-blue-400 font-mono font-bold">
                  {rawNames.length}
                </strong>
              ) : (
                '0'
              )}{' '}
              {rawNames.length === 1 ? 'category' : 'categories'} detected
            </span>
            <span className="text-[11px] text-slate-400">Lines without text are ignored</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
            Categories created here will be immediately available in the BOM Materials catalog and can be assigned to project stock items.
          </p>
        </div>

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
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || rawNames.length === 0}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>Add {rawNames.length > 0 ? `${rawNames.length} Categories` : 'Categories'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
