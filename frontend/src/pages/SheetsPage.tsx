import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { SpreadsheetSelector } from '../components/sheets/SpreadsheetSelector';
import { SheetCharts } from '../components/sheets/SheetCharts';
import { SheetDataTable } from '../components/sheets/SheetDataTable';
import { MetricCard } from '../components/common/MetricCard';
import { sheetsApi } from '../lib/sheetsApi';
import { SpreadsheetItem, WorksheetItem } from '../types';
import { MOCK_SPREADSHEETS } from '../data/mockData';
import { Table, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SheetsPage: React.FC = () => {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetItem[]>(MOCK_SPREADSHEETS);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>(
    MOCK_SPREADSHEETS[0].id
  );
  const [selectedWorksheetId, setSelectedWorksheetId] = useState<string>(
    MOCK_SPREADSHEETS[0].worksheets[0].id
  );
  const [activeWorksheet, setActiveWorksheet] = useState<WorksheetItem | null>(
    MOCK_SPREADSHEETS[0].worksheets[0]
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSpreadsheetData();
  }, []);

  const loadSpreadsheetData = async () => {
    setLoading(true);
    try {
      const res = await sheetsApi.getSpreadsheets();
      setSpreadsheets(res.data);
      if (res.data.length > 0) {
        let defaultSheetId = selectedSpreadsheetId;
        if (!res.data.find(s => s.id === defaultSheetId)) {
          defaultSheetId = res.data[0].id;
        }
        await handleSelectSpreadsheet(defaultSheetId, res.data);
      } else {
         setActiveWorksheet(null);
      }
    } catch (err) {
      console.error('Failed to load spreadsheets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSpreadsheet = async (sheetId: string, currentSheets = spreadsheets) => {
    setSelectedSpreadsheetId(sheetId);
    setLoading(true);
    try {
      const fullSheet = await sheetsApi.getSpreadsheet(sheetId);
      if (fullSheet && fullSheet.worksheets.length > 0) {
        setSpreadsheets(prev => {
          const list = prev.length > 0 ? prev : currentSheets;
          return list.map(s => s.id === sheetId ? { ...s, worksheets: fullSheet.worksheets } : s)
        });
        const firstWs = fullSheet.worksheets[0];
        setSelectedWorksheetId(firstWs.id);
        setActiveWorksheet(firstWs);
      } else {
        setActiveWorksheet(null);
      }
    } catch (err) {
      console.error('Failed to fetch sheet metadata', err);
    } finally {
      setLoading(false);
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
      <Header unreadCount={2} />

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
              Live bi-directional ledger reporting, vendor payables reconciliation, marketing funnel conversion, and metrics telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadSpreadsheetData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Sheet Data'}</span>
            </button>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#0f9d58] text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" />
              <span>Adapter Connected</span>
            </div>
          </div>
        </div>

        {/* 1. Spreadsheet & Worksheet Picker */}
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

        {/* 2. Worksheet KPI Cards */}
        {activeWorksheet && activeWorksheet.metrics && (
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
        {activeWorksheet && (
          <section aria-label="Worksheet Visual Charts">
            <SheetCharts worksheet={activeWorksheet} />
          </section>
        )}

        {/* 4. Tabular Data Records Table */}
        {activeWorksheet && (
          <section aria-label="Worksheet Records Table">
            <SheetDataTable worksheet={activeWorksheet} />
          </section>
        )}
      </main>
    </div>
  );
};

export default SheetsPage;
