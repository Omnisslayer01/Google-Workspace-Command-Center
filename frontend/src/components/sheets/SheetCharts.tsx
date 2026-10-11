import React from 'react';
import { WorksheetItem } from '../../types';
import { BarChart2, TrendingUp } from 'lucide-react';

interface SheetChartsProps {
  worksheet: WorksheetItem;
}

export const SheetCharts: React.FC<SheetChartsProps> = ({ worksheet }) => {
  const { chartData } = worksheet;
  if (!chartData) return null;

  const { categories, timeline } = chartData;

  // Compute category total
  const totalCategoryValue = categories.reduce((sum, c) => sum + c.value, 0);

  // Timeline values
  const maxTimelineValue = Math.max(...timeline.map((t) => t.value), 1);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Category Breakdown Bar Chart */}
      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#34A853]">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Category Distribution</h4>
              <p className="text-[11px] text-slate-500">Breakdown by operational category</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-slate-800">
            Total: {formatCurrency(totalCategoryValue)}
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {categories.map((cat, idx) => {
            const percentage = Math.round((cat.value / (totalCategoryValue || 1)) * 100);
            const color = cat.color || '#34A853';

            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-slate-800">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-500 text-[11px]">{percentage}%</span>
                    <span className="font-bold text-slate-900">{formatCurrency(cat.value)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Trend Line & Volume Chart */}
      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#4285F4]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Period Trend & Velocity</h4>
              <p className="text-[11px] text-slate-500">Transaction amounts and record throughput</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 font-semibold">
            +18.4% growth
          </span>
        </div>

        {/* Bar/Column visual for timeline */}
        <div className="pt-2">
          <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-slate-100 pb-2">
            {timeline.map((item, idx) => {
              const heightPct = Math.round((item.value / maxTimelineValue) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-md">
                    <div>{formatCurrency(item.value)}</div>
                    <div className="text-slate-400 font-mono">{item.count} items</div>
                  </div>

                  <div className="w-full max-w-[40px] bg-slate-100 rounded-t-md h-36 flex items-end justify-center overflow-hidden">
                    <div
                      className="w-full bg-[#4285F4] hover:bg-[#1a73e8] transition-all rounded-t-md"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 font-medium">
                    {item.period}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Range: {timeline[0]?.period} – {timeline[timeline.length - 1]?.period}</span>
            <span>Scale Max: {formatCurrency(maxTimelineValue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
