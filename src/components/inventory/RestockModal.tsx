'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Product } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { PlusCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lowStockProducts: Product[];
}

export const RestockModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  lowStockProducts,
}) => {
  const { success, error } = useNotification();
  const [restockAmounts, setRestockAmounts] = useState<{ [productId: number]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (productId: number, val: number) => {
    setRestockAmounts((prev) => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  const handleApplyRestock = async () => {
    const productsToUpdate = lowStockProducts.filter(
      (p) => restockAmounts[p.productId] && restockAmounts[p.productId] > 0
    );

    if (productsToUpdate.length === 0) {
      error('No Quantities Added', 'Please specify restock quantities to add.');
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;

    try {
      for (const product of productsToUpdate) {
        const addedQty = restockAmounts[product.productId] || 0;
        const newQty = product.quantity + addedQty;

        await apiService.updateProduct(product.productId, {
          productId: product.productId,
          name: product.name,
          description: product.description,
          price: product.price,
          quantity: newQty,
          categoryId: product.categoryId,
          supplierId: product.supplierId,
        });
        successCount++;
      }

      success('Restock Complete', `Successfully restocked ${successCount} products.`);
      setRestockAmounts({});
      onSuccess();
      onClose();
    } catch (err) {
      error('Restock Error', parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Batch Restock Items"
      subtitle="Quickly add inventory units to low-stock items"
      maxWidth="xl"
    >
      <div className="space-y-4">
        <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
          {lowStockProducts.map((product) => {
            const added = restockAmounts[product.productId] || 0;
            const newTotal = product.quantity + added;

            return (
              <div
                key={product.productId}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800"
              >
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">{product.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Current: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{product.quantity}</span> units • {product.supplierName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">+ Add:</span>
                    <input
                      type="number"
                      min="0"
                      value={restockAmounts[product.productId] || ''}
                      onChange={(e) =>
                        handleAmountChange(product.productId, parseInt(e.target.value, 10) || 0)
                      }
                      placeholder="0"
                      className="w-20 px-2.5 py-1.5 rounded-lg glass-input text-center font-mono text-sm"
                    />
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 block">New Total</span>
                    <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{newTotal}</span>
                  </div>
                </div>
              </div>
            );
          })}
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
            type="button"
            onClick={handleApplyRestock}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <PlusCircle className="w-4 h-4" />
            )}
            <span>Apply Restock</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
