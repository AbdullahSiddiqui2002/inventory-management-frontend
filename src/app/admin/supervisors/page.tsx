'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User, Project } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { SupervisorFormModal } from '@/components/supervisors/SupervisorFormModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import {
  HardHat,
  Plus,
  RotateCw,
  Search,
  Building2,
  Phone,
  Mail,
  Edit2,
  Trash2,
  AlertTriangle,
  LayoutGrid,
  List,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
  ArrowUpRight,
  Boxes,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AdminSupervisorsPage() {
  const router = useRouter();
  const { setSelectedAdminProjectId } = useAuth();
  const { success, error } = useNotification();
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'deployed' | 'standby'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [supervisorsData, projectsData] = await Promise.all([
        apiService.getSupervisors(),
        apiService.getProjects(),
      ]);
      setSupervisors(supervisorsData);
      setProjects(projectsData);
    } catch (err) {
      error('Failed to load supervisor data', parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setSelectedSupervisor(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (sup: User) => {
    setSelectedSupervisor(sup);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (sup: User) => {
    setSelectedSupervisor(sup);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSupervisor) return;
    setIsDeleting(true);
    try {
      await apiService.deleteSupervisor(selectedSupervisor.userId);
      success('Supervisor Removed', `Removed "${selectedSupervisor.fullName}".`);
      setIsDeleteModalOpen(false);
      setSelectedSupervisor(null);
      loadData();
    } catch (err) {
      error('Delete Failed', parseErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInspectSiteMaterials = (projectId: number) => {
    setSelectedAdminProjectId(projectId);
    router.push('/products');
  };

  // Helper to extract clean initials (e.g. "Farhan Siddiqui" -> "FS")
  const getInitials = (name: string) => {
    const parts = name.replace(/^(Engr\.?|Dr\.?|Mr\.?)\s+/i, '').trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Aggregated Supervisor KPIs
  const supervisorMetrics = useMemo(() => {
    const totalSupervisors = supervisors.length;
    const deployedCount = supervisors.filter((s) => s.assignedProjectId != null).length;
    const standbyCount = totalSupervisors - deployedCount;
    const totalProjects = projects.length;
    const unassignedSitesCount = Math.max(totalProjects - deployedCount, 0);
    const coveragePct = totalProjects > 0 ? Math.round((deployedCount / totalProjects) * 100) : 0;

    return {
      totalSupervisors,
      deployedCount,
      standbyCount,
      totalProjects,
      unassignedSitesCount,
      coveragePct,
    };
  }, [supervisors, projects]);

  // Filtered Supervisors
  const filteredSupervisors = useMemo(() => {
    return supervisors.filter((s) => {
      // 1. Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = s.fullName.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesPhone = s.phone?.toLowerCase().includes(q);
        const matchesSite = s.assignedProjectName?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesSite) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter === 'deployed' && !s.assignedProjectId) {
        return false;
      }
      if (statusFilter === 'standby' && s.assignedProjectId) {
        return false;
      }

      return true;
    });
  }, [supervisors, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Executive Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-600/10 via-orange-600/10 to-blue-600/10 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-blue-900/30 border border-amber-200/80 dark:border-amber-500/20 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Ambient Glow Accent */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        {/* Banner Details */}
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/90 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner Headquarters — Field Operations & Engineering</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-700 dark:text-blue-400 text-xs font-bold">
              <Sparkles className="w-3 h-3" />
              <span>Strict 1-to-1 Site Assignment</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Site Supervisors Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Manage field supervisors, oversee on-site deployment, credentials, contact channels, and strict 1-to-1 construction site assignments across Pakistan.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="h-10 w-10 rounded-2xl bg-white/95 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 cursor-pointer group"
            title="Refresh Supervisors List"
          >
            <RotateCw
              className={`w-4 h-4 transition-transform duration-500 ${
                isLoading
                  ? 'animate-spin text-amber-600 dark:text-amber-400'
                  : 'group-hover:rotate-180 text-slate-600 dark:text-slate-300'
              }`}
            />
          </button>

          <button
            onClick={handleOpenAdd}
            className="h-10 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 active:scale-95 shrink-0 cursor-pointer group shadow-lg shadow-amber-500/25 transition-all"
          >
            <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>New Site Supervisor</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Field Engineering KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Registered Supervisors */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Supervisors
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {supervisorMetrics.totalSupervisors}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {supervisorMetrics.deployedCount} Active • {supervisorMetrics.standbyCount} Standby
          </p>
        </div>

        {/* KPI 2: On-Site Incharges (Deployed) */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Deployed Incharges
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {supervisorMetrics.deployedCount}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active on construction sites
          </p>
        </div>

        {/* KPI 3: Standby Supervisors */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Standby Engineers
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {supervisorMetrics.standbyCount}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {supervisorMetrics.standbyCount > 0
              ? 'Available for new site deployment'
              : 'All supervisors deployed'}
          </p>
        </div>

        {/* KPI 4: Construction Site Coverage */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Site Coverage
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {supervisorMetrics.deployedCount} <span className="text-sm font-normal text-slate-400">/ {supervisorMetrics.totalProjects}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {supervisorMetrics.unassignedSitesCount > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                ⚠️ {supervisorMetrics.unassignedSitesCount} Sites without incharge
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ 100% sites supervised
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 3. Search, Filter & Layout Controls Toolbar */}
      <div className="glass-card rounded-2xl p-3.5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search supervisors by name, email, phone or site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & View Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({supervisors.length})
            </button>
            <button
              onClick={() => setStatusFilter('deployed')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                statusFilter === 'deployed'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Deployed ({supervisorMetrics.deployedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('standby')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                statusFilter === 'standby'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Standby ({supervisorMetrics.standbyCount})</span>
            </button>
          </div>

          {/* View Mode Grid vs Table */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Dense Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Supervisors Content: Grid or Table */}
      {filteredSupervisors.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <HardHat className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {searchTerm || statusFilter !== 'all'
              ? 'No Matching Field Supervisors Found'
              : 'No Site Supervisors Registered Yet'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {searchTerm || statusFilter !== 'all'
              ? 'Try clearing your search query or switching the status filter to see all supervisors.'
              : 'Register your first field engineer to assign them to active construction projects.'}
          </p>
          {searchTerm || statusFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 active:scale-95 shadow-lg shadow-amber-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register First Supervisor</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSupervisors.map((supervisor) => {
            const isAssigned = !!supervisor.assignedProjectId;
            const initials = getInitials(supervisor.fullName);

            return (
              <div
                key={supervisor.userId}
                className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-slate-200/90 dark:border-slate-800 hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 group interactive-card"
              >
                <div>
                  {/* Card Header: Avatar, Name, ID & Actions */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Gradient Initials Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                          {supervisor.fullName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            ID #{supervisor.userId}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-bold flex items-center gap-1 ${
                              isAssigned
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isAssigned ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                              }`}
                            />
                            {isAssigned ? 'Deployed' : 'Standby'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(supervisor)}
                        title="Edit Supervisor"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(supervisor)}
                        title="Delete Supervisor"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info Card */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 my-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a
                        href={`mailto:${supervisor.email}`}
                        className="truncate text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {supervisor.email}
                      </a>
                    </div>
                    {supervisor.phone ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <a
                          href={`tel:${supervisor.phone}`}
                          className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {supervisor.phone}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <Phone className="w-3.5 h-3.5 shrink-0 opacity-40" />
                        <span>No phone number registered</span>
                      </div>
                    )}
                  </div>

                  {/* Assigned Construction Site Box */}
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                      Assigned Construction Site (1-to-1)
                    </span>

                    {isAssigned ? (
                      <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {supervisor.assignedProjectCode && (
                                <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                  {supervisor.assignedProjectCode}
                                </span>
                              )}
                              <p className="text-xs font-bold text-blue-950 dark:text-blue-100 truncate">
                                {supervisor.assignedProjectName}
                              </p>
                            </div>
                            {supervisor.assignedProjectLocation && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{supervisor.assignedProjectLocation}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>Standby (No Site Assigned)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(supervisor)}
                          className="text-[10px] font-bold text-amber-800 dark:text-amber-300 hover:underline"
                        >
                          + Assign Site
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  {isAssigned ? (
                    <button
                      type="button"
                      onClick={() => handleInspectSiteMaterials(supervisor.assignedProjectId!)}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-50/90 dark:bg-blue-500/10 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/20 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 group/btn cursor-pointer shadow-xs active:scale-95"
                    >
                      <Boxes className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                      <span>Inspect Site Materials</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(supervisor)}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-50/90 dark:bg-amber-500/10 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/20 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 group/btn cursor-pointer shadow-xs active:scale-95"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Deploy to Construction Site</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Supervisor</th>
                  <th className="py-3.5 px-4">Contact Channels</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Construction Site</th>
                  <th className="py-3.5 px-4 text-center">Quick Action</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {filteredSupervisors.map((supervisor) => {
                  const isAssigned = !!supervisor.assignedProjectId;
                  const initials = getInitials(supervisor.fullName);

                  return (
                    <tr
                      key={supervisor.userId}
                      className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Supervisor Name & Avatar */}
                      <td className="py-3 px-4 min-w-[180px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {supervisor.fullName}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400">
                              ID #{supervisor.userId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Channels */}
                      <td className="py-3 px-4 min-w-[180px]">
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          {supervisor.email}
                        </p>
                        {supervisor.phone && (
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {supervisor.phone}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit ${
                            isAssigned
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAssigned ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {isAssigned ? 'Deployed' : 'Standby'}
                        </span>
                      </td>

                      {/* Assigned Site */}
                      <td className="py-3 px-4 min-w-[200px]">
                        {isAssigned ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              {supervisor.assignedProjectCode && (
                                <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                  {supervisor.assignedProjectCode}
                                </span>
                              )}
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {supervisor.assignedProjectName}
                              </p>
                            </div>
                            {supervisor.assignedProjectLocation && (
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {supervisor.assignedProjectLocation}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Standby (Unassigned)
                          </span>
                        )}
                      </td>

                      {/* Quick Action */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isAssigned ? (
                          <button
                            onClick={() => handleInspectSiteMaterials(supervisor.assignedProjectId!)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 text-[11px] font-bold transition-all flex items-center gap-1 mx-auto"
                          >
                            <Boxes className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenEdit(supervisor)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-600 hover:text-white text-amber-800 dark:text-amber-300 text-[11px] font-bold transition-all flex items-center gap-1 mx-auto"
                          >
                            <Building2 className="w-3 h-3" />
                            <span>Deploy</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(supervisor)}
                            title="Edit Supervisor"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(supervisor)}
                            title="Delete Supervisor"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Supervisor Modal */}
      <SupervisorFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={loadData}
        supervisorToEdit={selectedSupervisor}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Supervisor"
        message={`Are you sure you want to remove supervisor "${selectedSupervisor?.fullName}"? If assigned to a site, the site will automatically become unassigned.`}
        confirmText="Remove Supervisor"
        isLoading={isDeleting}
      />
    </div>
  );
}
