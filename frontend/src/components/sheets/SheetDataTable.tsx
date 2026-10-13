import React, { useState, useMemo } from 'react';
import { WorksheetItem, SheetColumn } from '../../types';
import {
  Search,
  ArrowUpDown,
  Table,
  Download,
} from 'lucide-react';

interface SheetDataTableProps {
  worksheet: WorksheetItem;
}

export const SheetDataTable: React.FC<SheetDataTableProps> = ({
  worksheet,
}) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  /*
   * ---------------------------------------------------------
   * NORMALIZE WORKSHEET DATA
   * ---------------------------------------------------------
   *
   * The API may temporarily return incomplete worksheet
   * metadata while the actual sheet data is loading.
   *
   * Never assume columns or records are arrays.
   */

  const columns: SheetColumn[] = useMemo(() => {
    if (!worksheet) return [];

    if (Array.isArray(worksheet.columns)) {
      return worksheet.columns;
    }

    return [];
  }, [worksheet]);

  const records: Record<string, any>[] = useMemo(() => {
    if (!worksheet) return [];

    /*
     * Normal format:
     *
     * records: [...]
     */
    if (Array.isArray(worksheet.records)) {
      return worksheet.records as Record<string, any>[];
    }

    /*
     * Defensive support for:
     *
     * records: {
     *   records: [...]
     * }
     */
    const recordsValue = worksheet.records as any;

    if (
      recordsValue &&
      typeof recordsValue === 'object' &&
      Array.isArray(recordsValue.records)
    ) {
      return recordsValue.records;
    }

    /*
     * Defensive support for:
     *
     * records: {
     *   results: [...]
     * }
     */
    if (
      recordsValue &&
      typeof recordsValue === 'object' &&
      Array.isArray(recordsValue.results)
    ) {
      return recordsValue.results;
    }

    return [];
  }, [worksheet]);

  /*
   * ---------------------------------------------------------
   * SORT
   * ---------------------------------------------------------
   */

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  /*
   * ---------------------------------------------------------
   * FILTER + SORT RECORDS
   * ---------------------------------------------------------
   */

  const filteredRecords = useMemo(() => {
    let list = [...records];

    /*
     * Search
     */
    if (search.trim()) {
      const q = search.trim().toLowerCase();

      list = list.filter((record) =>
        Object.values(record || {}).some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(q)
        )
      );
    }

    /*
     * Sort
     */
    if (sortKey) {
      list.sort((a, b) => {
        const valueA = a?.[sortKey];
        const valueB = b?.[sortKey];

        /*
         * Empty values go to the bottom.
         */
        if (
          valueA === undefined ||
          valueA === null ||
          valueA === ''
        ) {
          return sortAsc ? 1 : -1;
        }

        if (
          valueB === undefined ||
          valueB === null ||
          valueB === ''
        ) {
          return sortAsc ? -1 : 1;
        }

        /*
         * Numeric sorting
         */
        if (
          typeof valueA === 'number' &&
          typeof valueB === 'number'
        ) {
          return sortAsc
            ? valueA - valueB
            : valueB - valueA;
        }

        /*
         * String sorting
         */
        const result = String(valueA).localeCompare(
          String(valueB),
          undefined,
          {
            numeric: true,
            sensitivity: 'base',
          }
        );

        return sortAsc ? result : -result;
      });
    }

    return list;
  }, [records, search, sortKey, sortAsc]);

  /*
   * ---------------------------------------------------------
   * CELL RENDERING
   * ---------------------------------------------------------
   */

  const renderCellContent = (
    record: Record<string, any>,
    column: SheetColumn
  ) => {
    const value = record?.[column.key];

    if (value === undefined || value === null || value === '') {
      return (
        <span className="text-slate-400">
          -
        </span>
      );
    }

    /*
     * Currency
     */
    if (column.type === 'currency') {
      const numericValue = Number(value);

      return (
        <span className="font-mono font-semibold text-slate-900">
          {Number.isNaN(numericValue)
            ? String(value)
            : `$${numericValue.toLocaleString()}`}
        </span>
      );
    }

    /*
     * Status
     */
    if (column.type === 'status') {
      const status = String(value);

      const isGood =
        status === 'Reconciled' ||
        status === 'Active' ||
        status === 'Completed';

      const isPending =
        status === 'Pending Review' ||
        status === 'Proposal' ||
        status === 'Negotiation';

      const statusClass = isGood
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : isPending
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-slate-100 text-slate-700 border-slate-200';

      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusClass}`}
        >
          {status}
        </span>
      );
    }

    /*
     * Date
     */
    if (column.type === 'date') {
      return (
        <span className="font-mono text-slate-600">
          {String(value)}
        </span>
      );
    }

    /*
     * Default
     */
    return (
      <span className="text-slate-800">
        {String(value)}
      </span>
    );
  };

  /*
   * ---------------------------------------------------------
   * EMPTY / INVALID WORKSHEET STATE
   * ---------------------------------------------------------
   */

  if (!worksheet) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Table className="w-8 h-8 text-slate-300 mb-3" />

          <h3 className="text-sm font-semibold text-slate-700">
            No worksheet selected
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Select a worksheet to view its records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-4 p-6">

      {/* -------------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------------- */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Table className="w-4 h-4 text-[#34A853]" />

            <span>
              Worksheet Data Records
            </span>
          </h3>

          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredRecords.length} of {records.length} total rows
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* Search */}

          <div className="relative">

            <Search
              className="
                w-3.5
                h-3.5
                text-slate-400
                absolute
                left-3
                top-1/2
                -translate-y-1/2
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search table rows..."
              className="
                pl-9
                pr-3
                py-1.5
                border
                border-slate-300
                rounded-lg
                text-xs
                text-slate-900
                placeholder:text-slate-400
                focus:outline-none
                focus:ring-2
                focus:ring-[#34A853]/30
                focus:border-[#34A853]
                w-48
                sm:w-64
              "
            />

          </div>

          {/* Export */}

          <button
            type="button"
            onClick={() =>
              alert('Worksheet export generated.')
            }
            className="
              inline-flex
              items-center
              gap-1.5
              px-3
              py-1.5
              border
              border-slate-200
              hover:bg-slate-50
              rounded-lg
              text-xs
              font-semibold
              text-slate-700
              transition-colors
            "
          >
            <Download className="w-3.5 h-3.5" />

            <span className="hidden sm:inline">
              Export CSV
            </span>
          </button>

        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* NO DATA FROM API */}
      {/* -------------------------------------------------- */}

      {columns.length === 0 ? (
        <div className="border border-slate-200 rounded-lg bg-slate-50/50">

          <div className="flex flex-col items-center justify-center text-center py-12 px-6">

            <div className="
              w-10
              h-10
              rounded-lg
              bg-white
              border
              border-slate-200
              flex
              items-center
              justify-center
              mb-3
            ">
              <Table className="w-5 h-5 text-slate-300" />
            </div>

            <h4 className="text-sm font-semibold text-slate-700">
              No worksheet data available
            </h4>

            <p className="text-xs text-slate-400 mt-1 max-w-md">
              The worksheet metadata was loaded, but no
              columns or row data were returned by the
              Sheets API.
            </p>

          </div>

        </div>
      ) : (
        /* -------------------------------------------------- */
        /* TABLE */
        /* -------------------------------------------------- */

        <div className="overflow-x-auto border border-slate-200 rounded-lg">

          <table className="w-full text-left text-xs">

            {/* TABLE HEADER */}

            <thead className="
              bg-slate-50
              text-slate-600
              font-semibold
              font-mono
              uppercase
              tracking-wider
              border-b
              border-slate-200
            ">
              <tr>

                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() =>
                      handleSort(column.key)
                    }
                    className="
                      px-4
                      py-3
                      cursor-pointer
                      hover:bg-slate-100
                      transition-colors
                      select-none
                      whitespace-nowrap
                    "
                  >
                    <div className="flex items-center gap-1.5">

                      <span>
                        {column.label}
                      </span>

                      <ArrowUpDown
                        className={`
                          w-3
                          h-3
                          ${
                            sortKey === column.key
                              ? 'text-[#34A853]'
                              : 'text-slate-400'
                          }
                        `}
                      />

                    </div>
                  </th>
                ))}

              </tr>
            </thead>

            {/* TABLE BODY */}

            <tbody className="divide-y divide-slate-100 bg-white">

              {filteredRecords.length === 0 ? (
                <tr>

                  <td
                    colSpan={Math.max(columns.length, 1)}
                    className="px-4 py-12 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <Search className="w-6 h-6 text-slate-300 mb-2" />

                      <p className="text-xs font-medium text-slate-500">
                        {records.length === 0
                          ? 'No records available'
                          : 'No records match your search query.'}
                      </p>

                      {search && records.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearch('')}
                          className="
                            mt-2
                            text-[11px]
                            font-semibold
                            text-[#34A853]
                            hover:underline
                          "
                        >
                          Clear search
                        </button>
                      )}

                    </div>

                  </td>

                </tr>
              ) : (
                filteredRecords.map((record, rowIndex) => (
                  <tr
                    key={
                      record?.id ??
                      record?._id ??
                      `row-${rowIndex}`
                    }
                    className="
                      hover:bg-slate-50/70
                      transition-colors
                    "
                  >

                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="
                          px-4
                          py-3
                          whitespace-nowrap
                        "
                      >
                        {renderCellContent(
                          record,
                          column
                        )}
                      </td>
                    ))}

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default SheetDataTable;