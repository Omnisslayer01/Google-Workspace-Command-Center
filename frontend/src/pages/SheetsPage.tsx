import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { SpreadsheetSelector } from '../components/sheets/SpreadsheetSelector';
import { SheetDataTable } from '../components/sheets/SheetDataTable';
import { ExcelSpreadsheetView } from '../components/sheets/ExcelSpreadsheetView';
import { MetricCard } from '../components/common/MetricCard';
import { sheetsApi } from '../lib/sheetsApi';
import { SpreadsheetItem, WorksheetItem } from '../types';
import {
  Table,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';

export const SheetsPage: React.FC = () => {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetItem[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>('');
  const [selectedWorksheetId, setSelectedWorksheetId] = useState<string>('');
  const [activeWorksheet, setActiveWorksheet] = useState<WorksheetItem | null>(null);
  const [viewMode, setViewMode] = useState<'excel' | 'analytics'>('excel');
  const [loading, setLoading] = useState(true);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSpreadsheetData();
  }, []);

  const loadSpreadsheetData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await sheetsApi.getSpreadsheets();
      const sheetList = Array.isArray(res?.data) ? res.data : [];
      setSpreadsheets(sheetList);

      if (sheetList.length > 0) {
        let defaultSheetId = selectedSpreadsheetId;
        if (!defaultSheetId || !sheetList.find((s) => s.id === defaultSheetId)) {
          defaultSheetId = sheetList[0].id;
        }
        await handleSelectSpreadsheet(defaultSheetId, sheetList);
      } else {
        setSelectedSpreadsheetId('');
        setSelectedWorksheetId('');
        setActiveWorksheet(null);
      }
    } catch (err: any) {
      console.error('Failed to load spreadsheets:', err);
      setErrorMessage(
        err?.message || 'Failed to load Google Spreadsheets. Please ensure Google Workspace is connected.'
      );
      setSpreadsheets([]);
      setActiveWorksheet(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSpreadsheet = async (sheetId: string, currentSheets = spreadsheets) => {
    setSelectedSpreadsheetId(sheetId);
    setLoadingSheet(true);
    try {
      const fullSheet = await sheetsApi.getSpreadsheet(sheetId);
      if (fullSheet && fullSheet.worksheets && fullSheet.worksheets.length > 0) {
        setSpreadsheets((prev) => {
          const list = prev.length > 0 ? prev : currentSheets;
          return list.map((s) => (s.id === sheetId ? { ...s, worksheets: fullSheet.worksheets } : s));
        });
        const firstWs = fullSheet.worksheets[0];
        setSelectedWorksheetId(firstWs.id);
        setActiveWorksheet(firstWs);
      } else {
        setActiveWorksheet(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch sheet metadata', err);
      setErrorMessage(err?.message || `Failed to fetch sheet contents for ID: ${sheetId}`);
      setActiveWorksheet(null);
    } finally {
      setLoadingSheet(false);
    }
  };

  const handleSelectWorksheet = (wsId: string) => {
    setSelectedWorksheetId(wsId);
    const sheet = spreadsheets.find((s) => s.id === selectedSpreadsheetId);
    if (sheet) {
      const ws = sheet.worksheets.find((w) => w.id === wsId);
      if (ws) setActiveWorksheet(ws);
    }
  };

  const currentSpreadsheet = spreadsheets.find((s) => s.id === selectedSpreadsheetId);

  const handleDownloadExcel = async () => {
    if (!selectedSpreadsheetId) return;
    try {
      setIsExportingExcel(true);
      await sheetsApi.downloadExcel(
        selectedSpreadsheetId,
        `${currentSpreadsheet?.title || 'spreadsheet'}.xlsx`
      );
    } catch (err: any) {
      console.error('Failed to export to Excel:', err);
      window.open(
        `https://docs.google.com/spreadsheets/d/${selectedSpreadsheetId}/export?format=xlsx`,
        '_blank'
      );
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleOpenInGoogleSheets = () => {
    if (!selectedSpreadsheetId) return;
    const url =
      currentSpreadsheet?.webViewLink ||
      `https://docs.google.com/spreadsheets/d/${selectedSpreadsheetId}/edit`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-[#107c41] selection:text-white">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#107c41] font-mono">
                Spreadsheet Command Center
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">Google Sheets & Excel Bridge</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Spreadsheets & Workbook View
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Open, inspect, and analyze your Google Sheets just like Microsoft Excel with live cloud sync, formulas, and export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Open in Excel */}
            {selectedSpreadsheetId && (
              <button
                type="button"
                onClick={handleDownloadExcel}
                disabled={isExportingExcel}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#107c41] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-all disabled:opacity-50"
                title="Open spreadsheet in Microsoft Excel (.xlsx)"
              >
                {isExportingExcel ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                )}
                <span>{isExportingExcel ? 'Exporting...' : 'Open in Excel (.xlsx)'}</span>
              </button>
            )}

            {/* Quick Open in Google Sheets */}
            {selectedSpreadsheetId && (
              <button
                type="button"
                onClick={handleOpenInGoogleSheets}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
                title="Open live Google Sheets in a new tab"
              >
                <span>Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}

            {/* Refresh */}
            <button
              type="button"
              onClick={loadSpreadsheetData}
              disabled={loading || loadingSheet}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || loadingSheet ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {loading || loadingSheet ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[#107c41] text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#107c41]" />
              <span>Workspace Live</span>
            </div>
          </div>
        </div>

        {/* Error State */}
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Sheets Service Error</h3>
              <p className="mt-0.5 text-xs text-red-700 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
            <Loader2 className="w-8 h-8 text-[#107c41] animate-spin" />
            <p className="text-sm text-slate-600 font-medium">Loading Google Spreadsheets from your workspace...</p>
          </div>
        )}

        {/* Empty State when no sheets found */}
        {!loading && !errorMessage && spreadsheets.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#107c41] flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No Spreadsheets Found</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              We couldn&apos;t find any Google Sheets in your connected Google account. Create or share a sheet in Google Drive to view and open it here.
            </p>
          </div>
        )}

        {/* Spreadsheet Content */}
        {!loading && spreadsheets.length > 0 && (
          <>
            {/* 1. Spreadsheet & Worksheet Picker with Mode Switcher & Open Actions */}
            <section aria-label="Spreadsheet Selector">
              <SpreadsheetSelector
                spreadsheets={spreadsheets}
                selectedSpreadsheetId={selectedSpreadsheetId}
                selectedWorksheetId={selectedWorksheetId}
                onSelectSpreadsheet={handleSelectSpreadsheet}
                onSelectWorksheet={handleSelectWorksheet}
                activeWorksheet={activeWorksheet}
                viewMode={viewMode}
                onChangeViewMode={setViewMode}
                onDownloadExcel={handleDownloadExcel}
                isExportingExcel={isExportingExcel}
              />
            </section>

            {/* Sheet loading indicator */}
            {loadingSheet && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center flex items-center justify-center space-x-2 shadow-2xs">
                <Loader2 className="w-5 h-5 text-[#107c41] animate-spin" />
                <span className="text-sm text-slate-500 font-medium">Fetching worksheet data and formulas...</span>
              </div>
            )}

            {!loadingSheet && currentSpreadsheet && activeWorksheet && (
              <>
                {/* MODE A: EXCEL SPREADSHEET VIEW */}
                {viewMode === 'excel' && (
                  <section aria-label="Excel Spreadsheet Grid View">
                    <ExcelSpreadsheetView
                      spreadsheet={currentSpreadsheet}
                      activeWorksheet={activeWorksheet}
                      onSelectWorksheet={handleSelectWorksheet}
                      onRefresh={loadSpreadsheetData}
                    />
                  </section>
                )}

                {/* MODE B: ANALYTICS & CHARTS VIEW */}
                {viewMode === 'analytics' && (
                  <div className="space-y-6">
                    {/* Worksheet KPI Cards */}
                    {activeWorksheet.metrics && activeWorksheet.metrics.length > 0 && (
                      <section aria-label="Worksheet Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {activeWorksheet.metrics.map((metric, idx) => (
                          <MetricCard
                            key={idx}
                            label={metric.label}
                            value={metric.value}
                            change={metric.change}
                            changeType={metric.changeType}
                            subtext={metric.subtext}
                            topColor="#107c41"
                            icon={Table}
                          />
                        ))}
                      </section>
                    )}

                    {/* Visual Charts Section */}
                    <section aria-label="Worksheet Visual Charts">
                      <SheetCharts worksheet={activeWorksheet} />
                    </section>

                    {/* Tabular Data Records Table */}
                    <section aria-label="Worksheet Records Table">
                      <SheetDataTable worksheet={activeWorksheet} />
                    </section>
                  </div>
                )}
              </>
            )}

            {!loadingSheet && !activeWorksheet && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm shadow-2xs">
                No worksheet data found in this spreadsheet.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SheetsPage;
