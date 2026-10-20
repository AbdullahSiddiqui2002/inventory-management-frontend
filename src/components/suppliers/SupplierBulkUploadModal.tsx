'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Supplier } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SupplierBulkUploadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useNotification();
  const [jsonText, setJsonText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!jsonText.trim()) {
      error('Empty Data', 'Please provide suppliers JSON.');
      return;
    }

    let parsedList: Partial<Supplier>[] = [];
    try {
      parsedList = JSON.parse(jsonText);
      if (!Array.isArray(parsedList) || parsedList.length === 0) {
        error('Invalid Format', 'Data must be a non-empty array of suppliers.');
        return;
      }
    } catch {
      error('JSON Syntax Error', 'Please check the JSON formatting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createSuppliersBulk(parsedList);
      success('Bulk Upload Completed', `Successfully added ${parsedList.length} suppliers.`);
      onSuccess();
      onClose();
    } catch (err) {
      error('Bulk Upload Failed', parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Add Suppliers"
      subtitle="Import suppliers using JSON array"
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
            Suppliers Array (JSON)
          </label>
          <textarea
            rows={8}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={`[\n  {\n    "name": "NVIDIA Corporation",\n    "address": "2788 San Tomas Expy, Santa Clara, CA 95051",\n    "phone": "+1-408-486-2000"\n  },\n  {\n    "name": "Intel Corporation",\n    "address": "2200 Mission College Blvd, Santa Clara, CA 95054",\n    "phone": "+1-408-765-8080"\n  }\n]`}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input font-mono text-xs leading-relaxed"
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Upload Suppliers</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
