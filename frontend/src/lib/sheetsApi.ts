import { SpreadsheetItem, WorksheetItem, SheetColumn, SheetMetric } from '../types';
import { apiFetch } from './apiClient';

/**
 * Sheets Analytics API Client
 */
export const sheetsApi = {
  /**
   * Get all Google Sheets files.
   */
  async getSpreadsheets(): Promise<{
    data: SpreadsheetItem[];
    source: 'live';
  }> {
    const response = await apiFetch<any>('/api/sheets/spreadsheets/');

    const files = Array.isArray(response?.files)
      ? response.files
      : [];

    const data: SpreadsheetItem[] = files.map((f: any) => ({
      id: String(f.id),
      title: f.name || 'Untitled Spreadsheet',
      lastModified:
        f.modifiedTime || new Date().toISOString(),
      worksheets: [],
    }));

    return {
      data,
      source: 'live',
    };
  },

  /**
   * Get spreadsheet metadata + worksheet data.
   */
  async getSpreadsheet(
    spreadsheetId: string
  ): Promise<SpreadsheetItem | null> {
    try {
      const response = await apiFetch<any>(
        `/api/sheets/${spreadsheetId}/metadata/`
      );

      if (!Array.isArray(response?.sheets)) {
        return null;
      }

      /*
       * Fetch values for every worksheet.
       */
      const worksheets: WorksheetItem[] = await Promise.all(
        response.sheets.map(async (sheet: any) => {
          const properties = sheet?.properties || {};

          const worksheetId = String(
            properties.sheetId ?? '0'
          );

          const worksheetTitle =
            properties.title || 'Sheet1';

          let values: any[][] = [];

          try {
            /*
             * Sheet names containing spaces need quotes
             * in Google Sheets A1 notation.
             */
            const escapedTitle =
              String(worksheetTitle).replace(/'/g, "''");

            const range = `'${escapedTitle}'!A:ZZ`;

            const valuesResponse = await apiFetch<any>(
              `/api/sheets/${spreadsheetId}/values/?range=${encodeURIComponent(
                range
              )}`
            );

            if (Array.isArray(valuesResponse?.values)) {
              values = valuesResponse.values;
            }
          } catch (error) {
            console.error(
              `Failed to load values for worksheet "${worksheetTitle}"`,
              error
            );
          }

          /*
           * First row = column headers.
           * Remaining rows = records.
           */
          const headerRow =
            values.length > 0 && Array.isArray(values[0])
              ? values[0]
              : [];

          const dataRows =
            values.length > 1
              ? values.slice(1)
              : [];

          const columns: SheetColumn[] = headerRow.map(
            (header: any, index: number) => {
              const key =
                String(header || `column_${index + 1}`)
                  .trim()
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '_')
                  .replace(/^_|_$/g, '') ||
                `column_${index + 1}`;

              const sampleValues = dataRows
                .map((row) => row?.[index])
                .filter(
                  (value) =>
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== ''
                )
                .slice(0, 20);

              const type = inferColumnType(sampleValues);

              return {
                key,
                label:
                  String(header || `Column ${index + 1}`),
                type,
              };
            }
          );

          const records: Record<string, any>[] =
            dataRows.map((row: any[], rowIndex: number) => {
              const record: Record<string, any> = {
                id: `${worksheetId}-${rowIndex + 1}`,
              };

              columns.forEach((column, columnIndex) => {
                record[column.key] =
                  row?.[columnIndex] ?? '';
              });

              return record;
            });

          const metrics = buildMetrics(
            records,
            columns
          );

          const chartData = buildChartData(
            records,
            columns
          );

          return {
            id: worksheetId,
            title: worksheetTitle,
            rowCount: records.length,
            colCount: columns.length,
            metrics,
            columns,
            records,
            chartData,
          };
        })
      );

      return {
        id: spreadsheetId,
        title:
          response.properties?.title ||
          'Unknown Spreadsheet',
        lastModified: new Date().toISOString(),
        worksheets,
      };
    } catch (error) {
      console.error(
        'Failed to get spreadsheet metadata',
        error
      );

      return null;
    }
  },

  /**
   * Get a single worksheet.
   */
  async getWorksheet(
    spreadsheetId: string,
    worksheetId: string
  ): Promise<WorksheetItem | null> {
    const spreadsheet =
      await this.getSpreadsheet(spreadsheetId);

    if (!spreadsheet) {
      return null;
    }

    return (
      spreadsheet.worksheets.find(
        (worksheet) => worksheet.id === worksheetId
      ) || null
    );
  },
};

/**
 * Infer the frontend column type from Google Sheets values.
 */
function inferColumnType(
  values: any[]
): SheetColumn['type'] {
  if (values.length === 0) {
    return 'text';
  }

  const strings = values.map((value) =>
    String(value).trim()
  );

  /*
   * Status-like columns.
   */
  const statusWords = [
    'active',
    'inactive',
    'completed',
    'pending',
    'pending review',
    'reconciled',
    'proposal',
    'negotiation',
    'cancelled',
    'failed',
    'approved',
    'rejected',
  ];

  if (
    strings.every((value) =>
      statusWords.includes(value.toLowerCase())
    )
  ) {
    return 'status';
  }

  /*
   * Currency.
   */
  if (
    strings.some((value) =>
      /^[₹$€£]\s?-?\d[\d,]*(\.\d+)?$/.test(value)
    )
  ) {
    return 'currency';
  }

  /*
   * Numbers.
   */
  if (
    strings.length > 0 &&
    strings.every((value) => {
      const cleaned = value.replace(/,/g, '');
      return cleaned !== '' && !isNaN(Number(cleaned));
    })
  ) {
    return 'number';
  }

  /*
   * Dates.
   */
  if (
    strings.length > 0 &&
    strings.every((value) => {
      const parsed = Date.parse(value);
      return !isNaN(parsed);
    })
  ) {
    return 'date';
  }

  return 'text';
}

/**
 * Build basic KPI metrics.
 */
function buildMetrics(
  records: Record<string, any>[],
  columns: SheetColumn[]
): SheetMetric[] {
  const metrics: SheetMetric[] = [];

  metrics.push({
    label: 'Total Rows',
    value: records.length,
    subtext: 'Worksheet records',
    changeType: 'neutral',
  });

  metrics.push({
    label: 'Columns',
    value: columns.length,
    subtext: 'Detected columns',
    changeType: 'neutral',
  });

  const numericColumns = columns.filter(
    (column) =>
      column.type === 'number' ||
      column.type === 'currency'
  );

  metrics.push({
    label: 'Numeric Fields',
    value: numericColumns.length,
    subtext: 'Number / currency columns',
    changeType: 'neutral',
  });

  const statusColumn = columns.find(
    (column) => column.type === 'status'
  );

  const completedCount = statusColumn
    ? records.filter((record) => {
        const value = String(
          record[statusColumn.key] ?? ''
        ).toLowerCase();

        return (
          value === 'completed' ||
          value === 'active' ||
          value === 'reconciled'
        );
      }).length
    : 0;

  metrics.push({
    label: 'Positive Status',
    value: completedCount,
    subtext: statusColumn
      ? statusColumn.label
      : 'Status fields',
    changeType: 'positive',
  });

  return metrics;
}

/**
 * Build basic chart data from the worksheet.
 */
function buildChartData(
  records: Record<string, any>[],
  columns: SheetColumn[]
) {
  const numericColumn = columns.find(
    (column) =>
      column.type === 'number' ||
      column.type === 'currency'
  );

  const statusColumn = columns.find(
    (column) => column.type === 'status'
  );

  const categories: Array<{
    label: string;
    value: number;
    color?: string;
  }> = [];

  if (statusColumn) {
    const counts = new Map<string, number>();

    records.forEach((record) => {
      const value = String(
        record[statusColumn.key] ?? 'Unknown'
      );

      counts.set(
        value,
        (counts.get(value) || 0) + 1
      );
    });

    counts.forEach((value, label) => {
      categories.push({
        label,
        value,
      });
    });
  }

  if (
    categories.length === 0 &&
    numericColumn
  ) {
    records
      .slice(0, 10)
      .forEach((record, index) => {
        const value = Number(
          String(
            record[numericColumn.key] ?? 0
          ).replace(/,/g, '')
        );

        categories.push({
          label: `Row ${index + 1}`,
          value: isNaN(value) ? 0 : value,
        });
      });
  }

  return {
    categories,
    timeline: [],
  };
}