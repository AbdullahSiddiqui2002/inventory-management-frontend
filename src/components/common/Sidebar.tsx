'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  HardHat,
  Package,
  Tags,
  Truck,
  AlertTriangle,
  Settings,
  Boxes,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const pathname = usePathname();
  const { user, isAdmin, isSupervisor, logout } = useAuth();

  const adminNavItems = [
    { label: 'Multi-Site Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Construction Projects', href: '/admin/projects', icon: Building2 },
    { label: 'Site Supervisors', href: '/admin/supervisors', icon: HardHat },
    { label: 'Materials Inventory', href: '/products', icon: Package },
    { label: 'Categories', href: '/categories', icon: Tags },
    { label: 'Suppliers & Vendors', href: '/suppliers', icon: Truck },
    { label: 'Low Stock Alerts', href: '/inventory-alerts', icon: AlertTriangle },
    { label: 'System & Health', href: '/settings', icon: Settings },
  ];

  const supervisorNavItems = [
    { label: 'Site Overview', href: '/', icon: LayoutDashboard },
    { label: 'Site Materials', href: '/products', icon: Package },
    { label: 'Site Categories', href: '/categories', icon: Tags },
    { label: 'Site Suppliers', href: '/suppliers', icon: Truck },
    { label: 'Restock Alerts', href: '/inventory-alerts', icon: AlertTriangle },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : supervisorNavItems;

  return (
    <aside
      className={`fixed lg:static top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out glass-panel border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between ${
        isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-64'
      }`}
    >
      {/* Top Section */}
      <div className="overflow-y-auto">
        {/* Brand Logo with micro-glow */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 group cursor-default">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Boxes className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              StockCore <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-mono font-bold">Build</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Construction Enterprise ERP</p>
          </div>
        </div>

        {/* Current Active Workspace Indicator */}
        <div className="px-4 pt-3 pb-1">
          <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> : <HardHat className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                <span>{isAdmin ? 'HQ Owner Workspace' : 'Site Field Incharge'}</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-2xs ${
                isAdmin ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {user?.role || 'User'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {user?.fullName || 'Authenticated User'}
            </p>
            {isSupervisor && user?.assignedProjectName && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1 font-medium flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{user.assignedProjectName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Nav Links with Hover Slide & Active Glow */}
        <nav className="p-4 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            {isAdmin ? 'Enterprise Modules' : 'Site Operations'}
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group active:scale-[0.98] ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/90 dark:hover:bg-slate-800/70 hover:translate-x-1'
                }`}
              >
                {/* Active link left accent bar */}
                {isActive && (
                  <span className="absolute -left-1 top-2 bottom-2 w-1.5 rounded-full bg-white shadow-xs" />
                )}

                <Icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-115 ${
                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Session Logout Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80">
        <button
          type="button"
          onClick={logout}
          className="w-full py-2.5 px-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 hover:bg-rose-50 dark:hover:bg-rose-500/15 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all duration-200 active:scale-95 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs group cursor-pointer"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </aside>
  );
};
