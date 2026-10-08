import React from 'react';
import { HardDrive, FileText, FileSpreadsheet, Presentation, File, ExternalLink } from 'lucide-react';
import { DriveFileItem } from '../../types';

interface RecentDriveFilesCardProps {
  files: DriveFileItem[];
}

export const RecentDriveFilesCard: React.FC<RecentDriveFilesCardProps> = ({ files }) => {
  const getFileIcon = (type: DriveFileItem['type']) => {
    switch (type) {
      case 'spreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-[#34A853]" />;
      case 'document':
        return <FileText className="w-4 h-4 text-[#4285F4]" />;
      case 'presentation':
        return <Presentation className="w-4 h-4 text-[#FBBC04]" />;
      case 'pdf':
        return <File className="w-4 h-4 text-[#EA4335]" />;
      default:
        return <File className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between">
      {/* Top Drive Yellow hairline */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#FBBC04]" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#b45309]">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Drive Files</h3>
              <p className="text-xs text-slate-500">Workspace documents and attachments</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
            Google Drive API
          </span>
        </div>

        <div className="space-y-2.5">
          {files.map((file) => (
            <div
              key={file.id}
              className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#4285F4] transition-colors">
                    {file.name}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{file.owner}</span>
                    <span>•</span>
                    <span className="font-mono">{file.size}</span>
                    <span>•</span>
                    <span>{file.modifiedAt}</span>
                  </div>
                </div>
              </div>

              {file.webViewLink && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                  aria-label="Open in Google Drive"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Shared storage audit compliant</span>
        <span className="text-[11px] text-emerald-600 font-semibold">100% Scoped</span>
      </div>
    </div>
  );
};
