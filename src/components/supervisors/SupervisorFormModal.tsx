'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { User, SupervisorDto, Project } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { HardHat, Lock, Mail, Phone, User as UserIcon, Building2, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supervisorToEdit?: User | null;
}

export const SupervisorFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  supervisorToEdit,
}) => {
  const { success, error } = useNotification();
  const [unassignedProjects, setUnassignedProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<SupervisorDto>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    assignedProjectId: null,
  });

  const loadUnassigned = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const data = await apiService.getUnassignedProjects();
      setUnassignedProjects(data);
    } catch {
      setUnassignedProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadUnassigned();
    }
  }, [isOpen, loadUnassigned]);

  useEffect(() => {
    if (supervisorToEdit) {
      setFormData({
        userId: supervisorToEdit.userId,
        fullName: supervisorToEdit.fullName,
        email: supervisorToEdit.email,
        phone: supervisorToEdit.phone || '',
        password: '',
        assignedProjectId: supervisorToEdit.assignedProjectId || null,
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: 'pass123',
        assignedProjectId: null,
      });
    }
  }, [supervisorToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      error('Validation Error', 'Supervisor full name is required.');
      return;
    }
    if (!formData.email.trim()) {
      error('Validation Error', 'Supervisor email is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (supervisorToEdit) {
        await apiService.updateSupervisor(supervisorToEdit.userId, formData);
        success('Supervisor Updated', `Updated credentials and assignment for "${formData.fullName}".`);
      } else {
        await apiService.createSupervisor(formData);
        success('Supervisor Created', `Registered "${formData.fullName}" with 1-to-1 site assignment.`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      error(supervisorToEdit ? 'Update Failed' : 'Creation Failed', parseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build the list of projects to show in dropdown:
  // Show unassigned projects + if editing, include the currently assigned project as well!
  const availableProjects: { projectId: number; name: string; code: string }[] = [...unassignedProjects];
  if (
    supervisorToEdit &&
    supervisorToEdit.assignedProjectId &&
    !availableProjects.some((p) => p.projectId === supervisorToEdit.assignedProjectId)
  ) {
    availableProjects.unshift({
      projectId: supervisorToEdit.assignedProjectId,
      name: supervisorToEdit.assignedProjectName || 'Currently Assigned Project',
      code: supervisorToEdit.assignedProjectCode || 'CURRENT',
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supervisorToEdit ? 'Edit Site Supervisor' : 'Register Field Supervisor'}
      subtitle={
        supervisorToEdit
          ? `Updating Profile & Deployment for: ${supervisorToEdit.fullName} (ID #${supervisorToEdit.userId})`
          : 'Add a new field engineer and assign to an unassigned construction site'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name & Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Full Name & Designation <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Engr. Farhan Siddiqui (Project Engineer)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-semibold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Login Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="farhan@construction.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92-321-9988771"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Account Password {supervisorToEdit ? '(Leave blank to keep current password)' : <span className="text-rose-500">*</span>}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required={!supervisorToEdit}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={supervisorToEdit ? '••••••••' : 'Default password: pass123'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* 1-to-1 Project Assignment Dropdown */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Assign to Construction Project (1-to-1 Rule)
            </label>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Only unassigned sites are listed below. Each construction site has exactly 1 dedicated supervisor incharge.
          </p>

          <select
            value={formData.assignedProjectId ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                assignedProjectId: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-semibold text-slate-900 dark:text-white"
          >
            <option value="">-- Standby (No Site Assigned) --</option>
            {availableProjects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.code ? `[${p.code}] ` : ''}
                {p.name}
              </option>
            ))}
          </select>

          {isLoadingProjects && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Loading available construction sites...</p>
          )}

          {availableProjects.length === 0 && !isLoadingProjects && (
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
              ℹ️ All existing construction sites currently have assigned supervisors. This supervisor will remain in Standby until a new site is registered.
            </p>
          )}
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
            className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <HardHat className="w-4 h-4" />
            )}
            <span>{supervisorToEdit ? 'Save Supervisor' : 'Register Supervisor'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
