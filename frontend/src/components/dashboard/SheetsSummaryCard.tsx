import React from 'react';
import { Link } from 'react-router-dom';
import { Table, ArrowRight, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { SpreadsheetItem } from '../../types';

interface SheetsSummaryCardProps {
  sheets: SpreadsheetItem[];
}

export const SheetsSummaryCard: React.FC<SheetsSummaryCardProps> = ({ sheets }) => {
  const hasSheets = sheets && sheets.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between h-full">
      {/* Top Sheets Green hairline */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#34A853]" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0f9d58]">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Sheets Summary</h3>
              <p className="text-xs text-slate-500">Accessible spreadsheets in Google Drive</p>
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

        {!hasSheets ? (
          <div className="text-center py-8">
            <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No spreadsheets found in your account.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Create or share a sheet in Google Drive to view analytics here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Connected Spreadsheets</span>
              <span className="font-semibold text-[#0f9d58]">{sheets.length} Active</span>
            </div>

            {sheets.slice(0, 4).map((sheet) => (
              <div
                key={sheet.id}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-[#34A853]">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#34A853] transition-colors">
                      {sheet.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Modified {new Date(sheet.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <Link
                  to="/sheets"
                  className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                  aria-label="View in Sheets"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Continuous OAuth sync</span>
        <Link to="/sheets" className="text-[11px] text-[#34A853] font-medium hover:underline">
          View full ledger analytics →
        </Link>
      </div>
    </div>
  );
};
