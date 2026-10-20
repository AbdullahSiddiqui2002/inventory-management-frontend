'use client';

import React from 'react';
import { Menu, RefreshCw, Activity, LogOut, HardHat, ShieldCheck, Building2 } from 'lucide-react';
import { useHealth } from '@/context/HealthContext';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenAddModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { health, refreshHealth, isChecking } = useHealth();
  const { user, isAdmin, isSupervisor, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-slate-800/80 glass-panel px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white lg:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* User / Site Status Indicator with Hover Highlight */}
        <div className="hidden sm:flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 text-xs shadow-2xs hover:border-blue-300 dark:hover:border-blue-500/40 transition-colors">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">Owner Command Center</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold shadow-2xs">All Sites</span>
            </div>
          ) : isSupervisor ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 text-xs shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Site: {user?.assignedProjectName || 'Assigned Project'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold shadow-2xs">Supervisor</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Real-time Health Ping */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-slate-800 dark:text-slate-300 font-mono font-bold">
            {health.latencyMs ? `${health.latencyMs}ms` : '0ms'}
          </span>
          <button
            onClick={refreshHealth}
            disabled={isChecking}
            title="Refresh backend latency"
            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0.5 rounded-lg active:scale-90 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
          </button>
        </div>

        {/* Theme Toggle (Dark / Light) */}
        <ThemeToggle />

        {/* User Pill & Sign Out */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden lg:block text-right pr-1">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {user?.fullName || 'User'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{user?.email}</p>
          </div>

          <button
            onClick={logout}
            title="Sign Out Session"
            className="p-2 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all active:scale-90 shadow-2xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
