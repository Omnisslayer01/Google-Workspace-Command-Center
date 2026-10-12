import React, { useState, useMemo } from 'react';
import { WorksheetItem, SheetColumn } from '../../types';
import { Search, ArrowUpDown, Table, Download } from 'lucide-react';

interface SheetDataTableProps {
  worksheet: WorksheetItem;
}

export const SheetDataTable: React.FC<SheetDataTableProps> = ({ worksheet }) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const { columns, records } = worksheet;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filteredRecords = useMemo(() => {
    let list = [...records];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        Object.values(r).some((val) => String(val).toLowerCase().includes(q))
      );
    }

    if (sortKey) {
      list.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return list;
  }, [records, search, sortKey, sortAsc]);

  const renderCellContent = (record: Record<string, any>, col: SheetColumn) => {
    const val = record[col.key];
    if (val === undefined || val === null) return '-';

    if (col.type === 'currency') {
      return (
        <span className="font-mono font-semibold text-slate-900">
          ${Number(val).toLocaleString()}
        </span>
      );
    }

    if (col.type === 'status') {
      const statusStr = String(val);
      const isGood =
        statusStr === 'Reconciled' ||
        statusStr === 'Active' ||
        statusStr === 'Completed';
      const isPending =
        statusStr === 'Pending Review' ||
        statusStr === 'Proposal' ||
        statusStr === 'Negotiation';

      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
            isGood
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isPending
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          {statusStr}
        </span>
      );
    }

    if (col.type === 'date') {
      return <span className="font-mono text-slate-600">{String(val)}</span>;
    }

    return <span className="text-slate-800">{String(val)}</span>;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-4 p-6">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Table className="w-4 h-4 text-[#34A853]" />
            <span>Worksheet Data Records</span>
          </h3>
          <p className="text-xs text-slate-500">
            Showing {filteredRecords.length} of {records.length} total rows
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search table rows..."
              className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#34A853] w-48 sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={() => alert('Worksheet export generated.')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs divide-y divide-slate-200">
          <thead className="bg-slate-50 text-slate-600 font-semibold font-mono uppercase tracking-wider">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-slate-400 font-normal"
                >
                  No records match your search query.
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => (
                <tr
                  key={rec.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {renderCellContent(rec, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
