import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { SpreadsheetSelector } from '../components/sheets/SpreadsheetSelector';
import { SheetCharts } from '../components/sheets/SheetCharts';
import { SheetDataTable } from '../components/sheets/SheetDataTable';
import { MetricCard } from '../components/common/MetricCard';
import { sheetsApi } from '../lib/sheetsApi';
import { SpreadsheetItem, WorksheetItem } from '../types';
import { Table, RefreshCw, CheckCircle2, AlertTriangle, Loader2, FileSpreadsheet } from 'lucide-react';

export const SheetsPage: React.FC = () => {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetItem[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>('');
  const [selectedWorksheetId, setSelectedWorksheetId] = useState<string>('');
  const [activeWorksheet, setActiveWorksheet] = useState<WorksheetItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSheet, setLoadingSheet] = useState(false);
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-[#34A853] selection:text-white">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#34A853] font-mono">
                Structured Data & Ledger
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">Google Sheets Analytics</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Sheets Analytics & Reporting
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Live Google Sheets analytics, dynamic schema inspection, calculated metrics, and automated column detection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadSpreadsheetData}
              disabled={loading || loadingSheet}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || loadingSheet ? 'animate-spin' : ''}`} />
              <span>{loading || loadingSheet ? 'Refreshing...' : 'Refresh Sheet Data'}</span>
            </button>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#0f9d58] text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" />
              <span>Sheets API Live</span>
            </div>
          </div>
        </div>

        {/* Error State */}
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Sheets Analytics Error</h3>
              <p className="mt-0.5 text-xs text-red-700 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#34A853] animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading Google Spreadsheets from your account...</p>
          </div>
        )}

        {/* Empty State when no sheets found */}
        {!loading && !errorMessage && spreadsheets.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#34A853] flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No Spreadsheets Found</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              We couldn&apos;t find any Google Sheets in your connected Google account. Create or share a sheet in Google Drive to view analytics here.
            </p>
          </div>
        )}

        {/* 1. Spreadsheet & Worksheet Picker */}
        {!loading && spreadsheets.length > 0 && (
          <>
            <section aria-label="Spreadsheet Selector">
              <SpreadsheetSelector
                spreadsheets={spreadsheets}
                selectedSpreadsheetId={selectedSpreadsheetId}
                selectedWorksheetId={selectedWorksheetId}
                onSelectSpreadsheet={handleSelectSpreadsheet}
                onSelectWorksheet={handleSelectWorksheet}
                activeWorksheet={activeWorksheet}
              />
            </section>

            {/* Sheet loading indicator */}
            {loadingSheet && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 text-[#34A853] animate-spin" />
                <span className="text-sm text-slate-500 font-medium">Fetching worksheet rows and columns...</span>
              </div>
            )}

            {!loadingSheet && activeWorksheet && (
              <>
                {/* 2. Worksheet KPI Cards */}
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
                        topColor="#34A853"
                        icon={Table}
                      />
                    ))}
                  </section>
                )}

                {/* 3. Visual Charts Section */}
                <section aria-label="Worksheet Visual Charts">
                  <SheetCharts worksheet={activeWorksheet} />
                </section>

                {/* 4. Tabular Data Records Table */}
                <section aria-label="Worksheet Records Table">
                  <SheetDataTable worksheet={activeWorksheet} />
                </section>
              </>
            )}

            {!loadingSheet && !activeWorksheet && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
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
