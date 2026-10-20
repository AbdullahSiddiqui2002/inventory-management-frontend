'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Project } from '@/types';
import { Filter, ChevronDown, Check, Building2, Layers, Search, X, MapPin, User as UserIcon } from 'lucide-react';

interface Props {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  totalMaterialsCount?: number;
}

export const SiteFilterDropdown: React.FC<Props> = ({
  projects,
  selectedProjectId,
  onSelectProject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Selected project details
  const selectedProject = projects.find((p) => p.projectId.toString() === selectedProjectId);

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.supervisorName && p.supervisorName.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-20'}`} ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`h-10 px-3.5 rounded-2xl border transition-all duration-200 flex items-center gap-2.5 text-xs font-bold shadow-xs cursor-pointer select-none ${
          isOpen
            ? 'bg-blue-50/90 dark:bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-sm'
            : 'bg-white/95 dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm active:scale-95'
        }`}
      >
        <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
          <Filter className="w-3.5 h-3.5" />
        </div>

        {selectedProjectId === 'all' ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-slate-800 dark:text-slate-100">All Sites</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
              {projects.length}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 min-w-0">
            {selectedProject?.code && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 shrink-0">
                {selectedProject.code}
              </span>
            )}
            <span className="truncate max-w-[130px] sm:max-w-[170px] text-slate-800 dark:text-slate-100 font-bold">
              {selectedProject?.name || 'Selected Site'}
            </span>
          </div>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-0.5 ${
            isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Popup Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-900/15 dark:shadow-black/60 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5 dark:ring-white/5">
          {/* Header Row */}
          <div className="px-2 pt-1 pb-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Scope Dashboard By Site
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {projects.length} Active Sites
            </span>
          </div>

          {/* Quick Search Bar */}
          <div className="relative my-2 px-1">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search site, code or location..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {/* 1. All Sites Portfolio Option (only shown if not searching or if search matches portfolio) */}
            {(!searchQuery || 'all sites portfolio'.includes(searchQuery.toLowerCase())) && (
              <button
                type="button"
                onClick={() => {
                  onSelectProject('all');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                  selectedProjectId === 'all'
                    ? 'bg-blue-50 dark:bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 transition-colors ${
                      selectedProjectId === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-100/80 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white">All Sites Portfolio</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                      Aggregated metrics for all {projects.length} construction sites
                    </p>
                  </div>
                </div>

                {selectedProjectId === 'all' && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            )}

            {/* Separator */}
            {(!searchQuery || 'all sites portfolio'.includes(searchQuery.toLowerCase())) && (
              <div className="border-t border-slate-100 dark:border-slate-800/80 my-1" />
            )}

            {/* 2. Filtered Projects List */}
            {filteredProjects.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  No construction sites match &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : (
              filteredProjects.map((p) => {
                const isSelected = selectedProjectId === p.projectId.toString();
                return (
                  <button
                    key={p.projectId}
                    type="button"
                    onClick={() => {
                      onSelectProject(p.projectId.toString());
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                      <div
                        className={`p-2 rounded-xl shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>

                      <div className="text-left min-w-0">
                        {/* Site Name & Status */}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {p.name}
                          </span>
                        </div>

                        {/* Code, Status & Location Pill */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] mt-1">
                          <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100/80 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                            {p.code}
                          </span>

                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>

                          {p.location && (
                            <span className="text-slate-400 dark:text-slate-500 truncate max-w-[130px] flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{p.location}</span>
                            </span>
                          )}
                        </div>

                        {/* Supervisor row if present */}
                        {p.supervisorName && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                            <UserIcon className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span className="truncate">Incharge: {p.supervisorName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="mt-2 pt-2 px-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span>Click any site to scope metrics</span>
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px]">
              ESC to dismiss
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
