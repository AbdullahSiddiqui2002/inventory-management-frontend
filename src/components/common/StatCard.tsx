import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = 'from-blue-500/10 via-blue-500/5 to-transparent',
  iconColor = 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
  trend,
}) => {
  return (
    <div
      className={`glass-card rounded-3xl p-5 relative overflow-hidden bg-gradient-to-br ${gradient} border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group`}
    >
      {/* Decorative ambient background blur */}
      <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-current opacity-5 pointer-events-none blur-2xl group-hover:scale-125 transition-transform duration-500" />

      <div className="flex items-start justify-between relative z-10 gap-2">
        <div className="space-y-1.5 min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>

          <div className="flex items-baseline">
            {typeof value === 'string' && value.startsWith('PKR ') ? (
              <div className="flex items-baseline flex-wrap gap-1.5">
                <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 font-sans tracking-wide">
                  PKR
                </span>
                <span className="text-lg sm:text-xl lg:text-xl 2xl:text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight whitespace-nowrap">
                  {value.replace('PKR ', '')}
                </span>
              </div>
            ) : (
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-mono whitespace-nowrap">
                {value}
              </h3>
            )}
          </div>

          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
              {subtitle}
            </p>
          )}

          {trend && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                  trend.isPositive
                    ? 'text-emerald-700 bg-emerald-100 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                    : 'text-amber-800 bg-amber-100 border border-amber-200 dark:text-amber-300 dark:bg-amber-500/20 dark:border-amber-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    trend.isPositive ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span>{trend.value}</span>
              </span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-2xl border ${iconColor} shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
