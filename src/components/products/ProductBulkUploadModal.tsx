'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ProductDto, Category, Supplier } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { Upload, Download, FileSpreadsheet, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  suppliers: Supplier[];
}

export const ProductBulkUploadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  suppliers,
}) => {
  const { success, error } = useNotification();
  const [jsonText, setJsonText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setActiveTab] = useState<'csv' | 'json'>('csv');

  // Sample CSV generator
  const downloadSampleCsv = () => {
    const defaultCatId = categories[0]?.categoryId || 1;
    const defaultSupId = suppliers[0]?.id || 1;

    const headers = 'Name,Price,Quantity,Description,CategoryId,SupplierId';
    const sampleRows = [
      `"Logitech MX Master 3S Mouse",99.99,25,"Ergonomic wireless performance mouse",${defaultCatId},${defaultSupId}`,
      `"Dell UltraSharp 27 Monitor",349.50,12,"4K USB-C Hub Monitor",${defaultCatId},${defaultSupId}`,
      `"Keychron K2 Mechanical Keyboard",79.99,18,"Wireless mechanical keyboard RGB",${defaultCatId},${defaultSupId}`,
    ];

    const csvContent = [headers, ...sampleRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_bulk_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (file.name.endsWith('.json')) {
        setActiveTab('json');
        setJsonText(text);
      } else {
        try {
          const lines = text.split(/\r\n|\n/).filter((l) => l.trim() !== '');
          if (lines.length < 2) {
            error('Invalid CSV', 'CSV file must have a header row and at least one data row.');
            return;
          }

          const parsedProducts: ProductDto[] = [];
          for (let i = 1; i < lines.length; i++) {
            const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
            if (row.length >= 6) {
              parsedProducts.push({
                name: row[0].replace(/^"|"$/g, '').trim(),
                price: parseFloat(row[1].replace(/^"|"$/g, '').trim()) || 0,
                quantity: parseInt(row[2].replace(/^"|"$/g, '').trim(), 10) || 0,
                description: row[3].replace(/^"|"$/g, '').trim(),
                categoryId: parseInt(row[4].replace(/^"|"$/g, '').trim(), 10) || categories[0]?.categoryId || 1,
                supplierId: parseInt(row[5].replace(/^"|"$/g, '').trim(), 10) || suppliers[0]?.id || 1,
              });
            }
          }

          setJsonText(JSON.stringify(parsedProducts, null, 2));
          setActiveTab('json');
          success('CSV Loaded', `Loaded ${parsedProducts.length} items from CSV into editor.`);
        } catch {
          error('CSV Parsing Error', 'Failed to parse CSV format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!jsonText.trim()) {
      error('Empty Data', 'Please provide product data in JSON or upload a CSV.');
      return;
    }

    let parsedList: ProductDto[] = [];
    try {
      parsedList = JSON.parse(jsonText);
      if (!Array.isArray(parsedList) || parsedList.length === 0) {
        error('Invalid Format', 'Data must be a non-empty array of products.');
        return;
      }
    } catch {
      error('JSON Syntax Error', 'Please check the JSON formatting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.createProductsBulk(parsedList);
      success('Bulk Upload Successful', `Successfully created ${res.length || parsedList.length} products!`);
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
      title="Bulk Product Upload"
      subtitle="Import multiple products via CSV or JSON"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Upload & Template helpers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">CSV Template</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Download the pre-formatted CSV template populated with valid Category and Supplier IDs.
            </p>
            <button
              onClick={downloadSampleCsv}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/30 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Template</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Upload CSV / JSON</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Choose a file to automatically import and inspect the records before saving.
            </p>
            <label className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-300 dark:border-blue-500/30 rounded-xl transition-colors cursor-pointer text-center">
              <Upload className="w-4 h-4" />
              <span>Choose File</span>
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* JSON Preview & Editor */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Payload Preview / Editor (JSON)
            </label>
            <span className="text-[11px] text-slate-500">API Endpoint: POST /api/Product/bulk</span>
          </div>
          <textarea
            rows={8}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={`[\n  {\n    "name": "Example Product",\n    "price": 49.99,\n    "quantity": 10,\n    "description": "Product details",\n    "categoryId": 1,\n    "supplierId": 1\n  }\n]`}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input font-mono text-xs leading-relaxed"
          />
        </div>

        {/* Action buttons */}
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
            <span>Process Bulk Import</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
