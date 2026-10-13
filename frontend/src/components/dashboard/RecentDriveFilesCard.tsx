import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HardDrive,
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { DriveFileItem } from '../../types';

interface RecentDriveFilesCardProps {
  files: DriveFileItem[];
}

export const RecentDriveFilesCard: React.FC<RecentDriveFilesCardProps> = ({ files }) => {
  const [showAll, setShowAll] = useState(false);

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

  const displayedFiles = showAll ? files : files.slice(0, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between h-full">
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
          <Link
            to="/drive"
            className="text-xs font-semibold text-[#4285F4] hover:text-[#1a73e8] flex items-center gap-1 transition-colors group"
          >
            <span>Drive Explorer</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No files found in Google Drive.
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedFiles.map((file) => (
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
        )}

        {files.length > 5 && (
          <div className="mt-3 pt-2 text-right">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-semibold text-[#4285F4] hover:underline cursor-pointer"
            >
              {showAll ? 'Show fewer files' : `Show more (${files.length - 5} remaining)`}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Shared storage audit compliant</span>
        <Link to="/drive" className="text-[11px] text-[#4285F4] font-medium hover:underline">
          Open Drive →
        </Link>
      </div>
    </div>
  );
};
