'use client';

import React, { useState } from 'react';
import { useHealth } from '@/context/HealthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNotification } from '@/context/NotificationContext';
import { apiService, parseErrorMessage } from '@/services/api';
import {
  Settings,
  Activity,
  Server,
  Database,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

export default function SettingsPage() {
  const { health, apiUrl, isChecking, refreshHealth, updateApiUrl } = useHealth();
  const { theme, setTheme } = useTheme();
  const { success, error } = useNotification();
  const [customUrl, setCustomUrl] = useState(apiUrl);
  const [testResults, setTestResults] = useState<{
    health?: boolean;
    products?: boolean;
    categories?: boolean;
    suppliers?: boolean;
  }>({});
  const [isTestingAll, setIsTestingAll] = useState(false);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) {
      error('Invalid URL', 'Backend URL cannot be empty.');
      return;
    }
    updateApiUrl(customUrl.trim());
    success('Settings Updated', `API endpoint set to "${customUrl.trim()}".`);
  };

  const handleResetUrl = () => {
    const defaultUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    setCustomUrl(defaultUrl);
    updateApiUrl(defaultUrl);
    success('Reset', 'Restored default API URL.');
  };

  const handleRunFullDiagnostics = async () => {
    setIsTestingAll(true);
    setTestResults({});

    try {
      const healthRes = await apiService.checkHealth();
      const isHealthOk = healthRes.status === 'healthy';

      let isProdOk = false;
      let isCatOk = false;
      let isSupOk = false;

      try {
        await apiService.getProducts();
        isProdOk = true;
      } catch {}

      try {
        await apiService.getCategories();
        isCatOk = true;
      } catch {}

      try {
        await apiService.getSuppliers();
        isSupOk = true;
      } catch {}

      setTestResults({
        health: isHealthOk,
        products: isProdOk,
        categories: isCatOk,
        suppliers: isSupOk,
      });

      if (isHealthOk && isProdOk && isCatOk && isSupOk) {
        success('Diagnostics Passed', 'All backend endpoints are online and responding smoothly!');
      } else {
        error('Diagnostics Incomplete', 'Some endpoints could not be reached. Verify backend status.');
      }
    } catch (err) {
      error('Diagnostic Test Failed', parseErrorMessage(err));
    } finally {
      setIsTestingAll(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">System & API Settings</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Theme preferences, backend endpoint connectivity, diagnostics, and environment status
            </p>
          </div>
        </div>
      </div>

      {/* Theme Selection Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Appearance & Theme</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose between crisp Light Mode or futuristic Dark Mode</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
              theme === 'light'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold shadow-sm ring-2 ring-blue-500/20'
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Sun className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">Light Theme</p>
              <p className="text-xs text-slate-500">Clean, high-clarity day mode</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
              theme === 'dark'
                ? 'bg-blue-950/40 border-blue-500 text-blue-400 font-semibold shadow-sm ring-2 ring-blue-500/20'
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="p-2 rounded-lg bg-indigo-900/50 text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">Dark Theme</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sleek, low-glare night mode</p>
            </div>
          </button>
        </div>
      </div>

      {/* Live Connection Telemetry Card */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-3 rounded-2xl ${
                health.status === 'healthy'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
              }`}
            >
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Live API Telemetry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time status check against ASP.NET Core API</p>
            </div>
          </div>

          <button
            onClick={refreshHealth}
            disabled={isChecking}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
            <span>Ping Server</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
              Status
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  health.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span
                className={`text-base font-bold capitalize ${
                  health.status === 'healthy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {health.status}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
              Response Latency
            </span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
              {health.latencyMs ? `${health.latencyMs} ms` : '0 ms'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
              Last Pinged
            </span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
              {health.checkedAt || 'Just now'}
            </span>
          </div>
        </div>
      </div>

      {/* Backend API Configuration */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 mb-4">
          <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Backend API URL</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Change the target server URL if running on a custom port or cloud host (Render/Heroku/Railway)
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveUrl} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="http://localhost:5000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetUrl}
                className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                title="Reset to default"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Endpoint</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Full Endpoint Diagnostic Tester */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Endpoint Health Matrix</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verify all individual API routes are reachable</p>
            </div>
          </div>

          <button
            onClick={handleRunFullDiagnostics}
            disabled={isTestingAll}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isTestingAll ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span>Run Test Suite</span>
          </button>
        </div>

        <div className="space-y-2">
          {[
            { name: 'Health Check', path: 'GET /api/Health', key: 'health' as const },
            { name: 'Products API', path: 'GET /api/Product', key: 'products' as const },
            { name: 'Categories API', path: 'GET /api/Category', key: 'categories' as const },
            { name: 'Suppliers API', path: 'GET /api/Supplier', key: 'suppliers' as const },
          ].map((endpoint) => {
            const status = testResults[endpoint.key];
            return (
              <div
                key={endpoint.path}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{endpoint.name}</p>
                  <p className="text-xs font-mono text-slate-500">{endpoint.path}</p>
                </div>

                <div>
                  {status === true && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>200 OK</span>
                    </span>
                  )}
                  {status === false && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/20">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Unreachable</span>
                    </span>
                  )}
                  {status === undefined && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Not Tested</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pakistani Construction Demo Dataset Restorer */}
      <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🇵🇰</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Populate Pakistani Construction Dataset
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
              Clean out old random data and populate real Pakistani projects (Gulshan Heights, DHA Villa, Bahria Complex), authentic Pakistani suppliers (Lucky Cement, Amreli Steels, Pakistan Cables, Popular Pipes), realistic PKR prices, and localized construction materials.
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (!confirm('Are you sure you want to replace all database records with authentic Pakistani construction projects, materials, and suppliers?')) return;
              try {
                const res = await apiService.resetPakistaniData();
                success('Dataset Restored', res.message);
                setTimeout(() => window.location.href = '/', 1500);
              } catch (err) {
                error('Reset Failed', parseErrorMessage(err));
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Load Pakistani Construction Data</span>
          </button>
        </div>
      </div>

      {/* System & Architecture Info */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 mb-4">
          <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">System Architecture Overview</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Backend Architecture</span>
            <span className="text-slate-900 dark:text-slate-200 font-semibold mt-0.5 block">ASP.NET Core Web API 8.0</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Frontend Framework</span>
            <span className="text-slate-900 dark:text-slate-200 font-semibold mt-0.5 block">Next.js 15 (App Router + TypeScript)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">ORM & Database</span>
            <span className="text-slate-900 dark:text-slate-200 font-semibold mt-0.5 block">Entity Framework Core 8.0 (PostgreSQL / SQL Server)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Interactive Documentation</span>
            <a
              href={`${apiUrl}/swagger`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold mt-0.5 inline-flex items-center gap-1"
            >
              <span>Swagger UI Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
