'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Project, ProjectDto } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { Building2, MapPin, Hash, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectToEdit?: Project | null;
}

const BUDGET_PRESETS = [
  { label: 'PKR 5M (50 Lac)', value: 5000000 },
  { label: 'PKR 10M (1 Crore)', value: 10000000 },
  { label: 'PKR 25M (2.5 Crore)', value: 25000000 },
  { label: 'PKR 50M (5 Crore)', value: 50000000 },
];

const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Gwadar',
];

export const ProjectFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  projectToEdit,
}) => {
  const { success, error } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ProjectDto>({
    name: '',
    code: '',
    location: '',
    budget: 0,
    status: 'Active',
  });

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        projectId: projectToEdit.projectId,
        name: projectToEdit.name,
        code: projectToEdit.code,
        location: projectToEdit.location || '',
        budget: projectToEdit.budget,
        status: projectToEdit.status || 'Active',
      });
    } else {
      setFormData({
        name: '',
        code: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
        location: '',
        budget: 10000000,
        status: 'Active',
      });
    }
  }, [projectToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('Validation Error', 'Project name is required.');
      return;
    }
    if (!formData.code?.trim()) {
      error('Validation Error', 'Project code is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (projectToEdit) {
        await apiService.updateProject(projectToEdit.projectId, formData);
        success('Project Updated', `Updated "${formData.name}".`);
      } else {
        await apiService.createProject(formData);
        success('Project Created', `Registered construction site "${formData.name}".`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      error(projectToEdit ? 'Update Failed' : 'Creation Failed', parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? 'Edit Construction Project' : 'Register New Construction Site'}
      subtitle={projectToEdit ? `Updating Site Code: ${projectToEdit.code}` : 'Add a new active construction project and define its materials budget'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Project / Site Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Gulshan Executive Heights (Phase 2)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Code & Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Site Code <span className="text-rose-500">*</span></span>
              {!projectToEdit && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, code: `PRJ-${Math.floor(100 + Math.random() * 900)}` })}
                  className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  Generate
                </button>
              )}
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. GEH-101"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono font-bold uppercase text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Operational Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold text-slate-900 dark:text-white"
            >
              <option value="Active">🟢 Active Construction</option>
              <option value="OnHold">🟡 On Hold</option>
              <option value="Completed">⚪ Completed Project</option>
            </select>
          </div>
        </div>

        {/* Budget in PKR */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Allocated Material Budget (PKR)
            </label>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              PKR {(formData.budget || 0).toLocaleString('en-PK')}
            </span>
          </div>
          <input
            type="number"
            min="0"
            step="100000"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono font-bold text-slate-900 dark:text-white"
          />

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {BUDGET_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setFormData({ ...formData, budget: p.value })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                  formData.budget === p.value
                    ? 'bg-blue-50 dark:bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location & Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Site Location / Address
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <textarea
              rows={2}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Plot 14-C, Block 13D, Main University Road, Gulshan-e-Iqbal, Karachi"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* City quick buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] text-slate-400 font-medium">Quick add city:</span>
            {PAKISTAN_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  if (!formData.location?.includes(city)) {
                    setFormData({
                      ...formData,
                      location: formData.location ? `${formData.location.trim()}, ${city}` : city,
                    });
                  }
                }}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                +{city}
              </button>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-bold text-white btn-primary-glow rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Building2 className="w-4 h-4" />
            )}
            <span>{projectToEdit ? 'Update Construction Site' : 'Register Construction Site'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
