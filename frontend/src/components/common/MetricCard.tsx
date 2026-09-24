import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  icon?: LucideIcon;
  topColor?: string; // e.g. '#4285F4', '#EA4335', '#FBBC04', '#34A853'
  badge?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  changeType = 'neutral',
  subtext,
  icon: Icon,
  topColor = '#4285F4',
  badge,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs' : ''
      }`}
    >
      {/* Top semantic accent stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: topColor }}
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
          {label}
        </span>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200">
            {badge}
          </span>
        )}
        {Icon && !badge && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${topColor}15` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: topColor }} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {change && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
              changeType === 'positive'
                ? 'bg-emerald-50 text-[#0f9d58]'
                : changeType === 'negative'
                ? 'bg-red-50 text-[#ea4335]'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {changeType === 'positive' && <TrendingUp className="w-3 h-3" />}
            {changeType === 'negative' && <TrendingDown className="w-3 h-3" />}
            {changeType === 'neutral' && <Minus className="w-3 h-3" />}
            <span>{change}</span>
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-slate-500 leading-normal">
          {subtext}
        </p>
      )}
    </div>
  );
};
