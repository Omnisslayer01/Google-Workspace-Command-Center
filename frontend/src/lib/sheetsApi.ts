import { SpreadsheetItem, WorksheetItem } from '../types';
import { MOCK_SPREADSHEETS } from '../data/mockData';

/**
 * Sheets Analytics API Adapter
 * Uses local adaptor until BE2's final Sheets API contract is available.
 */
export const sheetsApi = {
  async getSpreadsheets(): Promise<{ data: SpreadsheetItem[]; source: 'adapter' }> {
    return { data: MOCK_SPREADSHEETS, source: 'adapter' };
  },

  async getSpreadsheet(id: string): Promise<SpreadsheetItem | null> {
    const found = MOCK_SPREADSHEETS.find((s) => s.id === id);
    return found || null;
  },

  async getWorksheet(spreadsheetId: string, worksheetId: string): Promise<WorksheetItem | null> {
    const sheet = MOCK_SPREADSHEETS.find((s) => s.id === spreadsheetId);
    if (!sheet) return null;
    const ws = sheet.worksheets.find((w) => w.id === worksheetId);
    return ws || null;
  },
};
