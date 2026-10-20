'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Boxes,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  HardHat,
  Building2,
  HelpCircle,
  KeyRound,
} from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    const success = await login(email, password);
    if (success) {
      router.push('/');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Cinematic Construction Site Background Image with Dark Vignette Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url('/construction-bg.jpg')`,
        }}
      />
      {/* Dark Blur / Gradient Overlay for Maximum Contrast and Focus */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/90 backdrop-blur-[3px]" />

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/30">
            <Boxes className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5 font-mono">
              StockCore <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-sans font-bold">Build</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Construction Inventory System</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-700/80 hover:border-slate-600 backdrop-blur-md"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Accounts Directory</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Centered Clean Login Box */}
      <main className="relative z-10 max-w-md w-full mx-auto px-4 my-auto py-6">
        <div className="rounded-3xl bg-slate-900/85 dark:bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl p-8 space-y-6">
          
          {/* Card Header */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 border border-blue-400/20 mb-3">
              <Boxes className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign In</h2>
            <p className="text-xs text-slate-400">
              Enter your credentials to access your construction workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@construction.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span>Remember session</span>
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer inside card */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-xs text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Need test accounts info?</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 py-4 text-center text-xs text-slate-400/80">
        StockCore Construction Management Portal &copy; {new Date().getFullYear()}
      </footer>

      {/* Authorized Accounts Directory Reference Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowHelpModal(false)}
          />
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-400" />
                <h4 className="text-base font-bold text-white">Authorized Login Credentials</h4>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Use these email and passwords in the login form:
            </p>

            <div className="space-y-2.5">
              {/* Admin */}
              <div
                onClick={() => {
                  setEmail('admin@construction.com');
                  setPassword('admin123');
                  setShowHelpModal(false);
                }}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Haji Abdul Rehman (Owner)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  admin@construction.com / admin123
                </p>
              </div>

              {/* Supervisor 1 */}
              <div
                onClick={() => {
                  setEmail('farhan@construction.com');
                  setPassword('pass123');
                  setShowHelpModal(false);
                }}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <HardHat className="w-4 h-4" />
                    <span>Engr. Farhan Siddiqui</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                    Supervisor
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  farhan@construction.com / pass123
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Site: Gulshan Commercial Complex</p>
              </div>

              {/* Supervisor 2 */}
              <div
                onClick={() => {
                  setEmail('tariq@construction.com');
                  setPassword('pass123');
                  setShowHelpModal(false);
                }}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-purple-400">
                    <Building2 className="w-4 h-4" />
                    <span>Tariq Mehmood (Site Incharge)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold">
                    Supervisor
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  tariq@construction.com / pass123
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Site: DHA Phase 8 Luxury Villa</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
