import React from 'react';
import { SpreadsheetItem, WorksheetItem } from '../../types';
import { FileSpreadsheet, Layers, Clock, Table } from 'lucide-react';

interface SpreadsheetSelectorProps {
  spreadsheets: SpreadsheetItem[];
  selectedSpreadsheetId: string;
  selectedWorksheetId: string;
  onSelectSpreadsheet: (id: string) => void;
  onSelectWorksheet: (id: string) => void;
  activeWorksheet: WorksheetItem | null;
}

export const SpreadsheetSelector: React.FC<SpreadsheetSelectorProps> = ({
  spreadsheets,
  selectedSpreadsheetId,
  selectedWorksheetId,
  onSelectSpreadsheet,
  onSelectWorksheet,
  activeWorksheet,
}) => {
  const currentSheet = spreadsheets.find((s) => s.id === selectedSpreadsheetId);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Spreadsheet Picker */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#34A853] shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#34A853] font-mono">
                Google Sheets Connector
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Modified: {currentSheet?.lastModified}</span>
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedSpreadsheetId}
                onChange={(e) => onSelectSpreadsheet(e.target.value)}
                className="text-base font-bold text-slate-900 bg-transparent pr-8 py-0.5 border-b border-dashed border-slate-300 hover:border-slate-500 focus:outline-hidden cursor-pointer"
              >
                {spreadsheets.map((sheet) => (
                  <option key={sheet.id} value={sheet.id}>
                    {sheet.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right: Worksheet Tabs */}
        {currentSheet && (
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50 self-start md:self-auto overflow-x-auto max-w-full">
            <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-400 font-mono">
              <Layers className="w-3.5 h-3.5" />
              <span>Tabs:</span>
            </div>

            {currentSheet.worksheets.map((ws) => {
              const isSelected = ws.id === selectedWorksheetId;
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => onSelectWorksheet(ws.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Table className="w-3.5 h-3.5 text-[#34A853]" />
                  <span>{ws.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">({ws.rowCount})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sub-bar: Active Worksheet telemetry */}
      {activeWorksheet && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-4">
            <span>Worksheet ID: <strong className="text-slate-700">{activeWorksheet.id}</strong></span>
            <span>Dimensions: <strong className="text-slate-700">{activeWorksheet.rowCount} rows × {activeWorksheet.colCount} cols</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[#34A853] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#34A853]" />
            <span>BE2 Google Sheets Adapter Active</span>
          </div>
        </div>
      )}
    </div>
  );
};
