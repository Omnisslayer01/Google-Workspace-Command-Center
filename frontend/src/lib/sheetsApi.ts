import { SpreadsheetItem, WorksheetItem } from '../types';
import { apiFetch } from './apiClient';

/**
 * Sheets Analytics API Client
 */
export const sheetsApi = {
  async getSpreadsheets(): Promise<{ data: SpreadsheetItem[]; source: 'live' }> {
    const response = await apiFetch<any>('/api/sheets/spreadsheets/');
    const files = response.files || [];
    
    const data: SpreadsheetItem[] = files.map((f: any) => ({
      id: f.id,
      title: f.name,
      lastModified: f.modifiedTime || new Date().toISOString(),
      worksheets: []
    }));
    return { data, source: 'live' };
  },

  async getSpreadsheet(id: string): Promise<SpreadsheetItem | null> {
    try {
      const response = await apiFetch<any>(`/api/sheets/${id}/metadata/`);
      if (!response.sheets) return null;
      
      const worksheets: WorksheetItem[] = response.sheets.map((s: any) => ({
        id: s.properties.sheetId?.toString() || '0',
        name: s.properties.title,
        rowCount: 0,
        columnCount: 0
      }));

      return {
        id,
        title: response.properties?.title || 'Unknown',
        lastModified: new Date().toISOString(),
        worksheets
      };
    } catch (err) {
      console.error('Failed to get spreadsheet metadata', err);
      return null;
    }
  },

  async getWorksheet(spreadsheetId: string, worksheetId: string): Promise<WorksheetItem | null> {
    const spreadsheet = await this.getSpreadsheet(spreadsheetId);
    if (!spreadsheet) return null;
    return spreadsheet.worksheets.find(w => w.id === worksheetId) || null;
  },
};
