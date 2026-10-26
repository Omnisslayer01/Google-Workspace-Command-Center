import React from 'react';
import { SpreadsheetItem, WorksheetItem } from '../../types';
import {
  FileSpreadsheet,
  Layers,
  Clock,
  Table,
  ExternalLink,
  Loader2,
  BarChart3,
  Grid,
} from 'lucide-react';

interface SpreadsheetSelectorProps {
  spreadsheets: SpreadsheetItem[];
  selectedSpreadsheetId: string;
  selectedWorksheetId: string;
  onSelectSpreadsheet: (id: string) => void;
  onSelectWorksheet: (id: string) => void;
  activeWorksheet: WorksheetItem | null;
  viewMode: 'excel' | 'analytics';
  onChangeViewMode: (mode: 'excel' | 'analytics') => void;
  onDownloadExcel?: () => void;
  isExportingExcel?: boolean;
}

export const SpreadsheetSelector: React.FC<SpreadsheetSelectorProps> = ({
  spreadsheets,
  selectedSpreadsheetId,
  selectedWorksheetId,
  onSelectSpreadsheet,
  onSelectWorksheet,
  activeWorksheet,
  viewMode,
  onChangeViewMode,
  onDownloadExcel,
  isExportingExcel = false,
}) => {
  const currentSheet = spreadsheets.find((s) => s.id === selectedSpreadsheetId);

  const handleOpenInGoogleSheets = () => {
    if (!currentSheet) return;
    const url =
      currentSheet.webViewLink ||
      `https://docs.google.com/spreadsheets/d/${currentSheet.id}/edit`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Top Row: Spreadsheet Selector + Action Buttons + View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Spreadsheet Picker */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#107c41] shrink-0 shadow-2xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#107c41] font-mono">
                Active Workbook
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  Modified:{' '}
                  {currentSheet?.lastModified
                    ? new Date(currentSheet.lastModified).toLocaleDateString()
                    : 'Recent'}
                </span>
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedSpreadsheetId}
                onChange={(e) => onSelectSpreadsheet(e.target.value)}
                className="text-base font-bold text-slate-900 bg-transparent pr-8 py-0.5 border-b border-dashed border-slate-300 hover:border-slate-500 focus:outline-hidden cursor-pointer max-w-xs sm:max-w-md truncate"
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

        {/* Right: View Mode Toggle & Open in Excel / Sheets Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle: Excel View vs Analytics View */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onChangeViewMode('excel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'excel'
                  ? 'bg-white text-[#107c41] font-bold shadow-2xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Open and view spreadsheet in authentic Excel grid view"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Excel View</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeViewMode('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'analytics'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="View analytics, KPI cards, charts, and data records"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#34A853]" />
              <span>Analytics & Charts</span>
            </button>
          </div>

          {/* Open in Microsoft Excel (.xlsx) button */}
          {onDownloadExcel && (
            <button
              type="button"
              onClick={onDownloadExcel}
              disabled={isExportingExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#107c41] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              title="Download and open in Microsoft Excel application"
            >
              {isExportingExcel ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#107c41]" />
              )}
              <span>{isExportingExcel ? 'Exporting...' : 'Open in Excel (.xlsx)'}</span>
            </button>
          )}

          {/* Open in Google Sheets in new tab */}
          <button
            type="button"
            onClick={handleOpenInGoogleSheets}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg shadow-2xs transition-colors"
            title="Open in Google Sheets in a new tab"
          >
            <span>Open in Google Sheets</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Middle Row: Worksheet Tabs */}
      {currentSheet && currentSheet.worksheets?.length > 0 && (
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50 self-start md:self-auto overflow-x-auto max-w-full">
          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-400 font-mono shrink-0">
            <Layers className="w-3.5 h-3.5" />
            <span>Sheets:</span>
          </div>

          {currentSheet.worksheets.map((ws) => {
            const isSelected = ws.id === selectedWorksheetId;
            return (
              <button
                key={ws.id}
                type="button"
                onClick={() => onSelectWorksheet(ws.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-[#107c41]" />
                <span>{ws.title}</span>
                <span className="text-[10px] font-mono text-slate-400">({ws.rowCount})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Sub-bar: Active Worksheet telemetry */}
      {activeWorksheet && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-4">
            <span>
              Worksheet ID: <strong className="text-slate-700">{activeWorksheet.id}</strong>
            </span>
            <span>
              Dimensions:{' '}
              <strong className="text-slate-700">
                {activeWorksheet.rowCount} rows × {activeWorksheet.colCount} cols
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[#107c41] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#107c41]" />
            <span>Google Sheets & Excel Bridge Active</span>
          </div>
        </div>
      )}
    </div>
  );
};
