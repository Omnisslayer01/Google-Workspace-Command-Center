import React from 'react';
import { Link } from 'react-router-dom';
import { Table, ArrowRight, TrendingUp, CheckCircle } from 'lucide-react';
import { MOCK_SPREADSHEETS } from '../../data/mockData';

export const SheetsSummaryCard: React.FC = () => {
  const activeSheet = MOCK_SPREADSHEETS[0];
  const primaryWs = activeSheet?.worksheets[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
      {/* Top Sheets Green hairline */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#34A853]" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0f9d58]">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Sheets Ledger KPIs</h3>
              <p className="text-xs text-slate-500">{activeSheet?.title || 'Spreadsheet Analytics'}</p>
            </div>
          </div>
          <Link
            to="/sheets"
            className="text-xs font-semibold text-[#34A853] hover:text-[#0f9d58] flex items-center gap-1 transition-colors group"
          >
            <span>Open Sheets</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mini KPI Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {primaryWs?.metrics.slice(0, 4).map((metric, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                {metric.label}
              </div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{metric.value}</div>
              {metric.change && (
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>{metric.change}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Live sync row indicator */}
        <div className="p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/50 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-[#34A853]" />
            <span className="font-medium">Active Ledger Tab: {primaryWs?.title}</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">{primaryWs?.rowCount} Rows Active</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Continuous OAuth audit trail</span>
        <span className="font-mono text-[11px] text-slate-600">Last update: 14 mins ago</span>
      </div>
    </div>
  );
};
