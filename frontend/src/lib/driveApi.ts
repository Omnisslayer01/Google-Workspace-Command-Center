import { apiFetch } from './apiClient';
import type { DriveFileItem } from '../types';

export interface DriveApiFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  parents?: string[];
  webViewLink?: string;
  owners?: Array<{
    displayName?: string;
    emailAddress?: string;
  }>;
}

interface DriveListResponse {
  files: DriveApiFile[];
  nextPageToken?: string;
}

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

const getFileType = (file: DriveApiFile): DriveFileItem['type'] => {
  if (file.mimeType === FOLDER_MIME_TYPE) {
    return 'folder';
  }

  if (file.mimeType.includes('spreadsheet')) {
    return 'spreadsheet';
  }

  if (file.mimeType.includes('presentation')) {
    return 'presentation';
  }

  if (file.mimeType.includes('pdf')) {
    return 'pdf';
  }

  return 'document';
};

const formatFileSize = (size?: string): string => {
  if (!size) return '—';

  const bytes = Number(size);

  if (!Number.isFinite(bytes)) return '—';

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const formatModifiedDate = (modifiedTime?: string): string => {
  if (!modifiedTime) return '—';

  const date = new Date(modifiedTime);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString();
};

const mapDriveFile = (file: DriveApiFile): DriveFileItem => ({
  id: file.id,
  name: file.name,
  type: getFileType(file),
  size: formatFileSize(file.size),
  modifiedAt: formatModifiedDate(file.modifiedTime),
  owner: file.owners?.[0]?.displayName ||
    file.owners?.[0]?.emailAddress ||
    'Unknown',
  sharedWith: [],
  webViewLink: file.webViewLink,
});

export async function listDriveFiles(
  folderId?: string,
  query?: string
): Promise<DriveFileItem[]> {
  const params = new URLSearchParams();

  if (folderId) {
    params.set('folder_id', folderId);
  }

  if (query) {
    params.set('query', query);
  }

  const queryString = params.toString();

  const response = await apiFetch<DriveListResponse>(
    `/api/drive/files/${queryString ? `?${queryString}` : ''}`
  );

  return (response.files || []).map(mapDriveFile);
}

export async function uploadDriveFile(
  file: File,
  folderId?: string
): Promise<DriveFileItem> {
  const formData = new FormData();

  formData.append('file', file);

  if (folderId) {
    formData.append('folder_id', folderId);
  }

  const response = await apiFetch<DriveApiFile>(
    '/api/drive/files/upload/',
    {
      method: 'POST',
      body: formData,
    }
  );

  return mapDriveFile(response);
}

export function getDriveDownloadUrl(fileId: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

  return `${baseUrl.replace(/\/+$/, '')}/api/drive/files/${fileId}/download/`;
}