import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  Download,
  Search,
  Table,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { SpreadsheetItem, WorksheetItem, SheetColumn } from '../../types';
import { sheetsApi } from '../../lib/sheetsApi';

interface ExcelSpreadsheetViewProps {
  spreadsheet: SpreadsheetItem;
  activeWorksheet: WorksheetItem | null;
  onSelectWorksheet: (worksheetId: string) => void;
  onRefresh?: () => void;
}

/**
 * Convert 0-based column index to Excel column letter (0 -> A, 25 -> Z, 26 -> AA, etc.)
 */
function getColumnLetter(colIndex: number): string {
  let letter = '';
  let temp = colIndex;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export const ExcelSpreadsheetView: React.FC<ExcelSpreadsheetViewProps> = ({
  spreadsheet,
  activeWorksheet,
  onSelectWorksheet,
  onRefresh,
}) => {
  // Selected cell coordinates
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({
    row: 0,
    col: 0,
  });
  const [formulaValue, setFormulaValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [embedView, setEmbedView] = useState<boolean>(false);
  const [copiedCell, setCopiedCell] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const formulaInputRef = useRef<HTMLInputElement>(null);

  // Columns & Records normalization
  const columns: SheetColumn[] = useMemo(() => {
    if (!activeWorksheet || !Array.isArray(activeWorksheet.columns)) return [];
    return activeWorksheet.columns;
  }, [activeWorksheet]);

  const records: Record<string, any>[] = useMemo(() => {
    if (!activeWorksheet) return [];
    if (Array.isArray(activeWorksheet.records)) return activeWorksheet.records;
    const recObj = activeWorksheet.records as any;
    if (recObj && Array.isArray(recObj.records)) return recObj.records;
    if (recObj && Array.isArray(recObj.results)) return recObj.results;
    return [];
  }, [activeWorksheet]);

  // Current selected cell address e.g. "B3"
  const selectedColLetter = useMemo(() => {
    return getColumnLetter(selectedCell.col);
  }, [selectedCell.col]);

  const selectedAddress = useMemo(() => {
    return `${selectedColLetter}${selectedCell.row + 1}`;
  }, [selectedColLetter, selectedCell.row]);

  // Active cell value
  const currentCellValue = useMemo(() => {
    if (records.length === 0 || columns.length === 0) return '';
    const row = records[selectedCell.row];
    const col = columns[selectedCell.col];
    if (!row || !col) return '';
    const val = row[col.key];
    return val !== undefined && val !== null ? String(val) : '';
  }, [records, columns, selectedCell]);

  // Sync formula bar with active cell value
  useEffect(() => {
    setFormulaValue(currentCellValue);
  }, [currentCellValue]);

  // Keyboard navigation across Excel grid
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in formula bar or an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCell((prev) => ({
          ...prev,
          row: Math.max(0, prev.row - 1),
        }));
      } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setSelectedCell((prev) => ({
          ...prev,
          row: Math.min(records.length - 1, prev.row + 1),
        }));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedCell((prev) => ({
          ...prev,
          col: Math.max(0, prev.col - 1),
        }));
      } else if (e.key === 'ArrowRight' || e.key === 'Tab') {
        e.preventDefault();
        setSelectedCell((prev) => ({
          ...prev,
          col: Math.min(columns.length - 1, prev.col + 1),
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [records.length, columns.length]);

  // Summary statistics for status bar (like Excel's bottom bar)
  const stats = useMemo(() => {
    if (columns.length === 0 || records.length === 0) {
      return { count: 0, sum: null, avg: null };
    }
    const activeCol = columns[selectedCell.col];
    if (!activeCol) return { count: records.length, sum: null, avg: null };

    const values = records.map((r) => r[activeCol.key]);
    const numValues = values
      .map((v) => Number(v))
      .filter((v) => !Number.isNaN(v) && v !== null && v !== undefined);

    if (numValues.length > 0 && (activeCol.type === 'number' || activeCol.type === 'currency')) {
      const sum = numValues.reduce((acc, val) => acc + val, 0);
      const avg = sum / numValues.length;
      return {
        count: records.length,
        numericCount: numValues.length,
        sum: activeCol.type === 'currency' ? `$${sum.toLocaleString()}` : sum.toLocaleString(),
        avg:
          activeCol.type === 'currency'
            ? `$${avg.toFixed(2).toLocaleString()}`
            : avg.toFixed(2),
      };
    }

    return { count: records.length, sum: null, avg: null };
  }, [records, columns, selectedCell.col]);

  // Open Google Sheet in new tab
  const handleOpenInGoogleSheets = () => {
    const webViewLink =
      spreadsheet.webViewLink ||
      `https://docs.google.com/spreadsheets/d/${spreadsheet.id}/edit`;
    window.open(webViewLink, '_blank', 'noopener,noreferrer');
  };

  // Download real .xlsx file to open in Microsoft Excel
  const handleDownloadExcel = async () => {
    try {
      setIsExporting(true);
      await sheetsApi.downloadExcel(spreadsheet.id, `${spreadsheet.title}.xlsx`);
    } catch (err) {
      console.error('Failed to export to Excel:', err);
      // Direct browser fallback
      window.open(
        `https://docs.google.com/spreadsheets/d/${spreadsheet.id}/export?format=xlsx`,
        '_blank'
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Export current active worksheet as CSV
  const handleExportCsv = () => {
    if (!activeWorksheet) return;
    sheetsApi.exportCsv(activeWorksheet, `${activeWorksheet.title}.csv`);
  };

  // Copy active cell value to clipboard
  const handleCopyCell = () => {
    if (currentCellValue) {
      navigator.clipboard.writeText(currentCellValue);
      setCopiedCell(true);
      setTimeout(() => setCopiedCell(false), 1500);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`bg-white border border-slate-300 rounded-xl shadow-md overflow-hidden flex flex-col transition-all duration-200 ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : 'w-full'
      }`}
      style={{ minHeight: isFullscreen ? 'auto' : '680px' }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. EXCEL-STYLE APPLICATION RIBBON & TITLE BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#107c41] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Left: Excel Brand Icon & Workbook Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 border border-white/20 text-white shadow-2xs shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight truncate max-w-xs sm:max-w-md">
                {spreadsheet.title}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider bg-white/20 px-1.5 py-0.5 rounded font-semibold text-emerald-100">
                .XLSX
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-100 font-mono">
              <span>{spreadsheet.worksheets?.length || 1} worksheets</span>
              <span>•</span>
              <span>
                {activeWorksheet ? `${activeWorksheet.rowCount} rows × ${activeWorksheet.colCount} cols` : 'Loading'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons (Open in Excel, Open in Sheets, etc.) */}
        <div className="flex items-center gap-2">
          {/* Open in Microsoft Excel button (.xlsx) */}
          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#107c41] font-bold text-xs shadow-xs hover:bg-emerald-50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75"
            title="Download and open this file in Microsoft Excel (.xlsx)"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>{isExporting ? 'Preparing Excel...' : 'Open in Excel (.xlsx)'}</span>
          </button>

          {/* Open in Google Sheets in new tab */}
          <button
            type="button"
            onClick={handleOpenInGoogleSheets}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-xs border border-white/20 shadow-xs transition-colors"
            title="Open live Google Sheets in a new tab"
          >
            <span>Open in Google Sheets</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* CSV Export */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
            title="Export active worksheet to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          {/* Cloud Embed Toggle */}
          <button
            type="button"
            onClick={() => setEmbedView((prev) => !prev)}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium text-xs transition-colors ${
              embedView
                ? 'bg-emerald-950 text-emerald-200 border border-emerald-400/40'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Toggle embedded Google Sheets live cloud preview"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{embedView ? 'Interactive Grid' : 'Cloud Embed'}</span>
          </button>

          {/* Refresh Sheet */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Refresh Sheet Data"
              aria-label="Refresh Sheet Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. EXCEL FORMULA BAR & TOOLBAR
          ───────────────────────────────────────────────────────────── */}
      {!embedView && (
        <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center gap-2 select-none text-xs">
          {/* Cell Name Box (e.g., A1, B3) */}
          <div className="flex items-center">
            <div
              className="bg-white border border-slate-300 rounded px-2.5 py-1 font-mono font-bold text-slate-800 shadow-2xs min-w-[54px] text-center"
              title="Active Cell Address"
            >
              {selectedAddress}
            </div>
          </div>

          {/* Formula 'fx' symbol */}
          <div className="flex items-center px-1 text-slate-400 font-serif italic font-bold text-sm select-none">
            fx
          </div>

          {/* Formula / Cell Content Input */}
          <div className="flex-1 min-w-[200px]">
            <input
              ref={formulaInputRef}
              type="text"
              value={formulaValue}
              onChange={(e) => setFormulaValue(e.target.value)}
              placeholder="Select a cell to view or inspect its formula / value..."
              className="w-full bg-white border border-slate-300 rounded px-3 py-1 font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#107c41] focus:ring-1 focus:ring-[#107c41] shadow-2xs"
            />
          </div>

          {/* Search filter within spreadsheet */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find in sheet..."
              className="w-36 sm:w-44 bg-white border border-slate-300 rounded pl-8 pr-2 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#107c41] focus:ring-1 focus:ring-[#107c41] shadow-2xs"
            />
          </div>

          {/* Copy cell button */}
          <button
            type="button"
            onClick={handleCopyCell}
            disabled={!currentCellValue}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-medium text-xs transition-colors disabled:opacity-40"
            title="Copy active cell value"
          >
            {copiedCell ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Table className="w-3.5 h-3.5" />}
            <span>{copiedCell ? 'Copied' : 'Copy Cell'}</span>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. EMBEDDED GOOGLE SHEETS CLOUD PREVIEW (IF TOGGLED)
          ───────────────────────────────────────────────────────────── */}
      {embedView ? (
        <div className="flex-1 bg-slate-100 relative min-h-[520px]">
          <iframe
            src={`https://docs.google.com/spreadsheets/d/${spreadsheet.id}/edit?widget=true&headers=true`}
            title={spreadsheet.title}
            className="w-full h-full min-h-[550px] border-none"
            allow="clipboard-write"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm text-xs text-slate-600 flex items-center gap-2">
            <span>Live Cloud Workspace</span>
            <button
              type="button"
              onClick={handleOpenInGoogleSheets}
              className="text-[#107c41] font-bold hover:underline inline-flex items-center gap-1"
            >
              Pop out <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            4. EXCEL SPREADSHEET GRID (COLUMNS A-Z, ROWS 1-N)
            ───────────────────────────────────────────────────────────── */
        <div className="flex-1 overflow-auto bg-slate-50 relative" style={{ maxHeight: isFullscreen ? 'calc(100vh - 170px)' : '550px' }}>
          {columns.length === 0 ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
              <Table className="w-8 h-8 text-slate-300" />
              <p className="font-semibold text-sm text-slate-700">No worksheet records loaded</p>
              <p className="text-xs text-slate-400">Select a worksheet tab below or refresh sheet data.</p>
            </div>
          ) : (
            <table className="border-collapse table-fixed w-max text-xs select-none">
              {/* Header Row: Column Letters (A, B, C...) + Column Names */}
              <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700 font-mono shadow-xs">
                <tr>
                  {/* Top-Left Corner Block */}
                  <th className="sticky left-0 z-30 w-12 min-w-12 bg-slate-200 border-b border-r border-slate-300 p-0 text-center text-[10px] text-slate-500 font-bold select-none">
                    <span className="block py-1.5">◢</span>
                  </th>

                  {/* Column Letter & Label Headers */}
                  {columns.map((column, colIdx) => {
                    const colLetter = getColumnLetter(colIdx);
                    const isColSelected = selectedCell.col === colIdx;

                    return (
                      <th
                        key={column.key}
                        onClick={() => setSelectedCell((prev) => ({ ...prev, col: colIdx }))}
                        className={`border-b border-r border-slate-300 px-3 py-1.5 text-center transition-colors cursor-pointer min-w-[130px] max-w-[240px] ${
                          isColSelected
                            ? 'bg-emerald-100/80 text-[#107c41] font-bold border-b-2 border-b-[#107c41]'
                            : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                        }`}
                      >
                        <div className="text-[11px] font-bold tracking-wider">{colLetter}</div>
                        <div className="text-[10px] font-sans font-medium text-slate-500 truncate mt-0.5">
                          {column.label}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Grid Body: Rows 1 to N */}
              <tbody className="bg-white divide-y divide-slate-200">
                {records.map((record, rowIdx) => {
                  const isRowSelected = selectedCell.row === rowIdx;

                  return (
                    <tr
                      key={record.id || rowIdx}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isRowSelected ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      {/* Row Index Number (1, 2, 3...) */}
                      <td
                        onClick={() => setSelectedCell((prev) => ({ ...prev, row: rowIdx }))}
                        className={`sticky left-0 z-10 w-12 min-w-12 border-r border-b border-slate-300 text-center font-mono text-[11px] font-semibold cursor-pointer select-none py-1.5 ${
                          isRowSelected
                            ? 'bg-emerald-100 text-[#107c41] font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {rowIdx + 1}
                      </td>

                      {/* Cells */}
                      {columns.map((column, colIdx) => {
                        const isCurrentCell =
                          selectedCell.row === rowIdx && selectedCell.col === colIdx;
                        const cellVal = record[column.key];
                        const displayVal = cellVal !== undefined && cellVal !== null ? String(cellVal) : '';

                        // Highlight cell matching search query
                        const isSearchMatch =
                          searchQuery.trim().length > 0 &&
                          displayVal.toLowerCase().includes(searchQuery.trim().toLowerCase());

                        return (
                          <td
                            key={column.key}
                            onClick={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                            className={`border-r border-b border-slate-200 px-3 py-1.5 text-xs text-slate-800 font-sans truncate relative min-w-[130px] max-w-[240px] cursor-cell ${
                              isCurrentCell
                                ? 'outline-2 outline-[#107c41] -outline-offset-2 bg-emerald-50/40 font-semibold'
                                : isSearchMatch
                                ? 'bg-amber-100 text-amber-900 font-medium'
                                : ''
                            } ${
                              column.type === 'currency' || column.type === 'number'
                                ? 'text-right font-mono'
                                : column.type === 'date'
                                ? 'text-center font-mono'
                                : 'text-left'
                            }`}
                            title={displayVal}
                          >
                            {/* Format display value */}
                            {column.type === 'currency' && !Number.isNaN(Number(cellVal)) && cellVal !== '' ? (
                              <span className="text-slate-900 font-semibold">
                                ${Number(cellVal).toLocaleString()}
                              </span>
                            ) : column.type === 'status' ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  String(displayVal).toLowerCase().includes('active') ||
                                  String(displayVal).toLowerCase().includes('complete') ||
                                  String(displayVal).toLowerCase().includes('reconciled')
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : String(displayVal).toLowerCase().includes('pending')
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {displayVal || '-'}
                              </span>
                            ) : (
                              <span>{displayVal || <span className="text-slate-300">-</span>}</span>
                            )}

                            {/* Excel Fill-Handle square on bottom-right of active cell */}
                            {isCurrentCell && (
                              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#107c41] pointer-events-none" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. EXCEL WORKBOOK TAB STRIP & BOTTOM STATUS BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-100 border-t border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-1.5 select-none text-xs">
        {/* Left: Worksheet Tabs (Sheet1, Sheet2, etc.) */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <div className="flex items-center text-slate-400 gap-0.5 mr-1">
            <button
              type="button"
              className="p-1 rounded hover:bg-slate-200 text-slate-500"
              title="Previous Sheet"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-slate-200 text-slate-500"
              title="Next Sheet"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Worksheet tab buttons */}
          {spreadsheet.worksheets &&
            spreadsheet.worksheets.map((ws) => {
              const isActive = activeWorksheet?.id === ws.id;

              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => onSelectWorksheet(ws.id)}
                  className={`px-3 py-1 text-xs rounded-t font-semibold transition-all flex items-center gap-1.5 border-t-2 ${
                    isActive
                      ? 'bg-white text-slate-900 border-[#107c41] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border-transparent'
                  }`}
                >
                  <Table className="w-3 h-3 text-[#107c41]" />
                  <span>{ws.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">({ws.rowCount})</span>
                </button>
              );
            })}
        </div>

        {/* Right: Excel Status Telemetry (READY, SUM, AVERAGE, COUNT) */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 shrink-0">
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-[#107c41] font-bold text-[10px]">
            READY
          </span>

          {stats.sum !== null && (
            <span>
              SUM: <strong className="text-slate-800">{stats.sum}</strong>
            </span>
          )}

          {stats.avg !== null && (
            <span>
              AVG: <strong className="text-slate-800">{stats.avg}</strong>
            </span>
          )}

          <span>
            COUNT: <strong className="text-slate-800">{stats.count}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExcelSpreadsheetView;
