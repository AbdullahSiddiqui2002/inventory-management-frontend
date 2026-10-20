'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { ProjectFormModal } from '@/components/projects/ProjectFormModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import {
  Building2,
  Plus,
  RotateCw,
  Search,
  MapPin,
  HardHat,
  Package,
  Boxes,
  Edit2,
  Trash2,
  ExternalLink,
  Coins,
  AlertTriangle,
  LayoutGrid,
  List,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserX,
  Phone,
  X,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export default function AdminProjectsPage() {
  const router = useRouter();
  const { setSelectedAdminProjectId } = useAuth();
  const { success, error } = useNotification();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'OnHold' | 'Completed'>('all');
  const [supervisorFilter, setSupervisorFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getProjects();
      setProjects(data);
    } catch (err) {
      error('Failed to load projects', parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleOpenAdd = () => {
    setSelectedProject(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setSelectedProject(p);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (p: Project) => {
    setSelectedProject(p);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProject) return;
    setIsDeleting(true);
    try {
      await apiService.deleteProject(selectedProject.projectId);
      success('Project Deleted', `Deleted "${selectedProject.name}".`);
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
      loadProjects();
    } catch (err) {
      error('Delete Failed', parseErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInspectInventory = (project: Project) => {
    setSelectedAdminProjectId(project.projectId);
    router.push('/products');
  };

  // Compact Currency Formatter for clean display without truncation
  const formatValuation = (amount: number) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    return amount.toLocaleString('en-PK');
  };

  // Aggregated Portfolio Metrics
  const portfolioMetrics = useMemo(() => {
    const totalProjects = projects.length;
    const activeCount = projects.filter((p) => p.status === 'Active').length;
    const onHoldCount = projects.filter((p) => p.status === 'OnHold').length;
    const completedCount = projects.filter((p) => p.status === 'Completed').length;
    const assignedCount = projects.filter((p) => !!p.supervisorName).length;
    const unassignedCount = totalProjects - assignedCount;
    const totalValuation = projects.reduce((sum, p) => sum + (p.totalInventoryValuation || 0), 0);
    const totalMaterials = projects.reduce((sum, p) => sum + (p.totalMaterialsCount || 0), 0);
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

    return {
      totalProjects,
      activeCount,
      onHoldCount,
      completedCount,
      assignedCount,
      unassignedCount,
      totalValuation,
      totalMaterials,
      totalBudget,
    };
  }, [projects]);

  // Filtered list based on search, status, and supervisor filters
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // 1. Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesLocation = p.location?.toLowerCase().includes(q);
        const matchesSupervisor = p.supervisorName?.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesLocation && !matchesSupervisor) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }

      // 3. Supervisor filter
      if (supervisorFilter === 'assigned' && !p.supervisorName) {
        return false;
      }
      if (supervisorFilter === 'unassigned' && p.supervisorName) {
        return false;
      }

      return true;
    });
  }, [projects, searchTerm, statusFilter, supervisorFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Executive Command Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-900/40 dark:via-indigo-900/30 dark:to-purple-900/30 border border-blue-200/80 dark:border-blue-500/20 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Ambient Glow Accent */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        {/* Banner Details */}
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner Headquarters — Multi-Project Oversight</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{portfolioMetrics.activeCount} Active Sites</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Construction Projects Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Manage active construction sites, supervise field engineers, allocate material budgets, and track inventory valuations across Pakistan.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={loadProjects}
            disabled={isLoading}
            className="h-10 w-10 rounded-2xl bg-white/95 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 cursor-pointer group"
            title="Refresh Projects List"
          >
            <RotateCw
              className={`w-4 h-4 transition-transform duration-500 ${
                isLoading
                  ? 'animate-spin text-blue-600 dark:text-blue-400'
                  : 'group-hover:rotate-180 text-slate-600 dark:text-slate-300'
              }`}
            />
          </button>

          <button
            onClick={handleOpenAdd}
            className="h-10 px-4 rounded-2xl btn-primary-glow text-xs font-bold flex items-center gap-2 active:scale-95 shrink-0 cursor-pointer group shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>New Construction Project</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Portfolio KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Construction Sites */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Sites
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {portfolioMetrics.totalProjects}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {portfolioMetrics.activeCount} Active • {portfolioMetrics.onHoldCount} On Hold
          </p>
        </div>

        {/* KPI 2: Total Materials Valuation */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Materials Valuation
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0" title={`PKR ${portfolioMetrics.totalValuation.toLocaleString('en-PK')}`}>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">PKR</span>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatValuation(portfolioMetrics.totalValuation)}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Across all site warehouses
          </p>
        </div>

        {/* KPI 3: Site Supervisors Assigned */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Field Supervisors
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {portfolioMetrics.assignedCount} <span className="text-sm font-normal text-slate-400">/ {portfolioMetrics.totalProjects}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {portfolioMetrics.unassignedCount > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                ⚠️ {portfolioMetrics.unassignedCount} Sites unassigned
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ All sites supervised
              </span>
            )}
          </p>
        </div>

        {/* KPI 4: Total Materials Recorded */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 relative overflow-hidden interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recorded Materials
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {portfolioMetrics.totalMaterials}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cement, steel rebars, sand & tiles
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
            placeholder="Search site, code, location or supervisor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
          {/* Status Filter */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'Active'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Active ({portfolioMetrics.activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('OnHold')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'OnHold'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              On Hold ({portfolioMetrics.onHoldCount})
            </button>
          </div>

          {/* Supervisor Filter */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
            <button
              onClick={() => setSupervisorFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                supervisorFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="All Supervisor statuses"
            >
              All
            </button>
            <button
              onClick={() => setSupervisorFilter('assigned')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                supervisorFilter === 'assigned'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Only assigned sites"
            >
              <UserCheck className="w-3 h-3" />
              <span>Assigned</span>
            </button>
            <button
              onClick={() => setSupervisorFilter('unassigned')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                supervisorFilter === 'unassigned'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Only unassigned sites"
            >
              <UserX className="w-3 h-3" />
              <span>Unassigned ({portfolioMetrics.unassignedCount})</span>
            </button>
          </div>

          {/* View Mode Grid vs Table */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
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
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Dense Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Projects Content: Grid or Table */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {searchTerm || statusFilter !== 'all' || supervisorFilter !== 'all'
              ? 'No Matching Construction Sites Found'
              : 'No Construction Sites Registered Yet'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {searchTerm || statusFilter !== 'all' || supervisorFilter !== 'all'
              ? 'Try adjusting your search criteria or resetting the active status/supervisor filters.'
              : 'Create your first construction project to begin tracking site materials and field supervisors.'}
          </p>
          {(searchTerm || statusFilter !== 'all' || supervisorFilter !== 'all') ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSupervisorFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2.5 rounded-xl btn-primary-glow text-xs font-bold flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Site</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const valuation = project.totalInventoryValuation || 0;
            const budget = project.budget || 0;
            const budgetPct = budget > 0 ? Math.round((valuation / budget) * 100) : 0;
            const isOverBudget = budget > 0 && valuation > budget;

            return (
              <div
                key={project.projectId}
                className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-slate-200/90 dark:border-slate-800 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 group interactive-card"
              >
                <div>
                  {/* Card Top: Code, Status & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-500/20 font-mono text-xs font-extrabold tracking-wide">
                        {project.code}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                          project.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : project.status === 'OnHold'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                            : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            project.status === 'Active'
                              ? 'bg-emerald-500 animate-pulse'
                              : project.status === 'OnHold'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span>{project.status || 'Active'}</span>
                      </span>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(project)}
                        title="Edit Project Details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(project)}
                        title="Delete Project"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Location */}
                  <h3
                    onClick={() => handleInspectInventory(project)}
                    className="text-lg font-extrabold text-slate-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    {project.name}
                  </h3>

                  {project.location && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{project.location}</span>
                    </p>
                  )}

                  {/* Supervisor Card Box */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400 dark:text-slate-500">
                        Site Incharge
                      </span>
                    </div>
                    {project.supervisorName ? (
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                          <HardHat className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {project.supervisorName}
                          </p>
                          {project.supervisorPhone && (
                            <a
                              href={`tel:${project.supervisorPhone}`}
                              className="text-[10px] font-mono text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>{project.supervisorPhone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>No Supervisor Assigned</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => router.push('/admin/supervisors')}
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          + Assign
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inventory & Valuation Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3.5">
                    {/* Materials Count */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/60">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <Package className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-semibold text-[11px]">Materials</span>
                      </div>
                      <p className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100">
                        {project.totalMaterialsCount || 0}{' '}
                        <span className="text-xs font-normal text-slate-400">SKUs</span>
                      </p>
                    </div>

                    {/* Material Valuation (Strictly in PKR) */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/60 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <Coins className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-semibold text-[11px]">Valuation</span>
                      </div>
                      <div className="flex items-baseline gap-1 min-w-0" title={`PKR ${valuation.toLocaleString('en-PK')}`}>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          PKR
                        </span>
                        <p className="text-sm font-extrabold font-mono text-slate-900 dark:text-slate-100">
                          {formatValuation(valuation)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Budget Utilization Progress Bar */}
                  {budget > 0 && (
                    <div className="mb-4 px-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-medium">
                        <span>
                          Budget: <strong className="font-mono text-slate-700 dark:text-slate-300">PKR {budget >= 10000000 ? `${(budget / 10000000).toFixed(1)} Cr` : `${(budget / 1000000).toFixed(1)}M`}</strong>
                        </span>
                        <span className={`font-bold font-mono ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                          {budgetPct}% Used
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverBudget
                              ? 'bg-rose-500'
                              : budgetPct > 80
                              ? 'bg-amber-500'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          }`}
                          style={{ width: `${Math.min(budgetPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action: Inspect Materials */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleInspectInventory(project)}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-50/90 dark:bg-blue-500/10 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/20 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 group/btn cursor-pointer shadow-xs active:scale-95"
                  >
                    <Boxes className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                    <span>Inspect Site Materials</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Site Code</th>
                  <th className="py-3.5 px-4">Project & Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Supervisor Incharge</th>
                  <th className="py-3.5 px-4 text-center">Materials</th>
                  <th className="py-3.5 px-4">Valuation (PKR)</th>
                  <th className="py-3.5 px-4">Allocated Budget</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {filteredProjects.map((project) => {
                  const valuation = project.totalInventoryValuation || 0;
                  const budget = project.budget || 0;

                  return (
                    <tr
                      key={project.projectId}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Code */}
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20">
                          {project.code}
                        </span>
                      </td>

                      {/* Name & Location */}
                      <td className="py-3 px-4 min-w-[200px]">
                        <p
                          onClick={() => handleInspectInventory(project)}
                          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        >
                          {project.name}
                        </p>
                        {project.location && (
                          <p className="text-[11px] text-slate-400 truncate max-w-xs flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span>{project.location}</span>
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit ${
                            project.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : project.status === 'OnHold'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              project.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {project.status || 'Active'}
                        </span>
                      </td>

                      {/* Supervisor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {project.supervisorName ? (
                          <div className="flex items-center gap-1.5">
                            <HardHat className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {project.supervisorName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Unassigned
                          </span>
                        )}
                      </td>

                      {/* Materials Count */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {project.totalMaterialsCount || 0}
                      </td>

                      {/* Valuation */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        <span className="text-[10px] text-emerald-600 font-bold mr-1">PKR</span>
                        {valuation.toLocaleString('en-PK')}
                      </td>

                      {/* Budget */}
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        PKR {budget.toLocaleString('en-PK')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleInspectInventory(project)}
                            title="Inspect Inventory"
                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(project)}
                            title="Edit Project"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(project)}
                            title="Delete Project"
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

      {/* Add / Edit Project Modal */}
      <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={loadProjects}
        projectToEdit={selectedProject}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Construction Project"
        message={`Are you sure you want to delete "${selectedProject?.name}" (${selectedProject?.code})? All scoped materials, categories, and suppliers for this project will be deleted.`}
        confirmText="Delete Project"
        isLoading={isDeleting}
      />
    </div>
  );
}
