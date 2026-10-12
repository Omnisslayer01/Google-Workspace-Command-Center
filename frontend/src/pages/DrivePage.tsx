import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Download,
  File,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  HardDrive,
  Loader2,
  RefreshCw,
  Search,
  Upload,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import {
  getDriveDownloadUrl,
  listDriveFiles,
  uploadDriveFile,
} from '../lib/driveApi';
import type { DriveFileItem } from '../types';

const getFileIcon = (type: DriveFileItem['type']) => {
  switch (type) {
    case 'folder':
      return <Folder className="h-5 w-5 text-[#FBBC04]" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="h-5 w-5 text-[#34A853]" />;
    case 'document':
      return <FileText className="h-5 w-5 text-[#4285F4]" />;
    case 'pdf':
      return <File className="h-5 w-5 text-[#EA4335]" />;
    default:
      return <File className="h-5 w-5 text-slate-500" />;
  }
};

export const DrivePage: React.FC = () => {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [folderStack, setFolderStack] = useState<
    Array<{ id?: string; name: string }>
  >([{ name: 'My Drive' }]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const currentFolder = folderStack[folderStack.length - 1];

  const loadFiles = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await listDriveFiles(currentFolder.id, search);
      setFiles(result);
    } catch (err: any) {
      setError(err?.message || 'Unable to load Google Drive files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [currentFolder.id]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    await loadFiles();
  };

  const openFolder = (folder: DriveFileItem) => {
    setFolderStack((current) => [
      ...current,
      {
        id: folder.id,
        name: folder.name,
      },
    ]);

    setSearch('');
  };

  const goBack = () => {
    if (folderStack.length <= 1) return;

    setFolderStack((current) => current.slice(0, -1));
    setSearch('');
  };

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError('');

    try {
      await uploadDriveFile(file, currentFolder.id);
      await loadFiles();
    } catch (err: any) {
      setError(err?.message || 'Unable to upload file.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        {/* Page heading */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-[#b45309]">
              <HardDrive className="h-4 w-4" />
              Drive Workspace
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Drive Explorer
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Browse and manage files connected to your Google Workspace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadFiles}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#4285F4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3367D6]">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}

              {uploading ? 'Uploading...' : 'Upload'}

              <input
                type="file"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Search + breadcrumb */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={goBack}
                disabled={folderStack.length <= 1}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="flex flex-wrap items-center gap-1 text-slate-500">
                {folderStack.map((folder, index) => (
                  <React.Fragment key={`${folder.id || 'root'}-${index}`}>
                    {index > 0 && (
                      <span className="px-1 text-slate-300">/</span>
                    )}

                    <span
                      className={
                        index === folderStack.length - 1
                          ? 'font-semibold text-slate-900'
                          : ''
                      }
                    >
                      {folder.name}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <form onSubmit={handleSearch} className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search files..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-blue-100"
              />
            </form>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Google Drive unavailable</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Files */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid grid-cols-[minmax(260px,2fr)_1fr_1fr_120px_80px] border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Name</span>
            <span>Owner</span>
            <span>Modified</span>
            <span>Size</span>
            <span></span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Google Drive...
            </div>
          ) : files.length === 0 ? (
            <div className="py-16 text-center">
              <FolderOpen className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-700">
                No files found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                This folder doesn't contain any matching files.
              </p>
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-[minmax(260px,2fr)_1fr_1fr_120px_80px] items-center border-b border-slate-100 px-5 py-4 last:border-b-0 hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                    {getFileIcon(file.type)}
                  </div>

                  {file.type === 'folder' ? (
                    <button
                      type="button"
                      onClick={() => openFolder(file)}
                      className="truncate text-left text-sm font-semibold text-slate-800 hover:text-[#4285F4]"
                    >
                      {file.name}
                    </button>
                  ) : (
                    <span className="truncate text-sm font-semibold text-slate-800">
                      {file.name}
                    </span>
                  )}
                </div>

                <span className="truncate pr-3 text-sm text-slate-600">
                  {file.owner}
                </span>

                <span className="truncate pr-3 text-sm text-slate-500">
                  {file.modifiedAt}
                </span>

                <span className="text-sm text-slate-500">
                  {file.size}
                </span>

                <div className="flex justify-end">
                  {file.type !== 'folder' && (
                    <a
                      href={getDriveDownloadUrl(file.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 text-xs text-slate-400">
          Google Drive · {files.length} item{files.length === 1 ? '' : 's'}
        </div>
      </main>
    </div>
  );
};

export default DrivePage;