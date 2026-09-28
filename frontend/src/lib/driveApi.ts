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
  success?: boolean;
  data?:
    | {
        files?: DriveApiFile[];
        nextPageToken?: string;
        results?: DriveApiFile[];
        count?: number;
      }
    | DriveApiFile[];
  files?: DriveApiFile[];
  results?: DriveApiFile[];
  nextPageToken?: string;
  count?: number;
}

const FOLDER_MIME_TYPE =
  'application/vnd.google-apps.folder';

/**
 * Convert Google Drive MIME type
 * into the application's file type.
 */
const getFileType = (
  file: DriveApiFile
): DriveFileItem['type'] => {
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

/**
 * Format bytes into readable file size.
 */
const formatFileSize = (
  size?: string
): string => {
  if (
    size === undefined ||
    size === null ||
    size === ''
  ) {
    return '—';
  }

  const bytes = Number(size);

  if (!Number.isFinite(bytes)) {
    return '—';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
};

/**
 * Format modified date.
 */
const formatModifiedDate = (
  modifiedTime?: string
): string => {
  if (!modifiedTime) {
    return '—';
  }

  const date = new Date(modifiedTime);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString();
};

/**
 * Convert backend Drive object
 * into frontend DriveFileItem.
 */
const mapDriveFile = (
  file: DriveApiFile
): DriveFileItem => {
  return {
    id: file.id,
    name: file.name,
    type: getFileType(file),
    size: formatFileSize(file.size),
    modifiedAt: formatModifiedDate(
      file.modifiedTime
    ),
    owner:
      file.owners?.[0]?.displayName ||
      file.owners?.[0]?.emailAddress ||
      'Unknown',
    sharedWith: [],
    webViewLink: file.webViewLink,
  };
};

/**
 * Extract Drive files from the different
 * response formats supported by the backend.
 *
 * Supports:
 *
 * 1. { files: [...] }
 *
 * 2. { results: [...] }
 *
 * 3. { data: { files: [...] } }
 *
 * 4. { data: { results: [...] } }
 *
 * 5. { data: [...] }
 */
const extractDriveFiles = (
  response: DriveListResponse
): DriveApiFile[] => {
  if (!response) {
    return [];
  }

  // Direct:
  // { files: [...] }
  if (
    Array.isArray(response.files)
  ) {
    return response.files;
  }

  // Direct:
  // { results: [...] }
  if (
    Array.isArray(response.results)
  ) {
    return response.results;
  }

  const data = response.data;

  // { data: [...] }
  if (Array.isArray(data)) {
    return data;
  }

  // { data: { files: [...] } }
  if (
    data &&
    typeof data === 'object'
  ) {
    if (
      Array.isArray(data.files)
    ) {
      return data.files;
    }

    // { data: { results: [...] } }
    if (
      Array.isArray(data.results)
    ) {
      return data.results;
    }
  }

  return [];
};

/**
 * List files from Google Drive.
 */
export async function listDriveFiles(
  folderId?: string,
  query?: string
): Promise<DriveFileItem[]> {
  const params =
    new URLSearchParams();

  if (folderId) {
    params.set(
      'folder_id',
      folderId
    );
  }

  if (query) {
    params.set(
      'query',
      query
    );
  }

  const queryString =
    params.toString();

  const endpoint =
    `/api/drive/files/${
      queryString
        ? `?${queryString}`
        : ''
    }`;

  const response =
    await apiFetch<DriveListResponse>(
      endpoint
    );

  console.log(
    'DRIVE FILES API RESPONSE:',
    response
  );

  const files =
    extractDriveFiles(response);

  console.log(
    'EXTRACTED DRIVE FILES:',
    files
  );

  return files.map(mapDriveFile);
}

/**
 * Upload a file to Google Drive.
 *
 * IMPORTANT:
 * Do not manually set Content-Type.
 * apiClient handles FormData correctly.
 */
export async function uploadDriveFile(
  file: File,
  folderId?: string
): Promise<DriveFileItem> {
  const formData =
    new FormData();

  formData.append(
    'file',
    file
  );

  if (folderId) {
    formData.append(
      'folder_id',
      folderId
    );
  }

  const response =
    await apiFetch<any>(
      '/api/drive/files/upload/',
      {
        method: 'POST',
        body: formData,
      }
    );

  /**
   * Backend currently returns:
   *
   * {
   *   success: true,
   *   data: {
   *     id: "...",
   *     name: "...",
   *     ...
   *   }
   * }
   *
   * Also support a direct object just in case.
   */
  const fileData =
    response?.data ||
    response?.result ||
    response;

  if (
    !fileData ||
    !fileData.id
  ) {
    throw new Error(
      'Upload succeeded, but the backend did not return valid file data.'
    );
  }

  return mapDriveFile(
    fileData as DriveApiFile
  );
}

/**
 * Download a Google Drive file.
 *
 * IMPORTANT:
 * Do NOT open this URL directly with
 * window.open(), because the browser will
 * not automatically attach the JWT.
 */
export async function downloadDriveFile(
  fileId: string
): Promise<Blob> {
  if (!fileId) {
    throw new Error(
      'A valid Google Drive file ID is required.'
    );
  }

  const blob =
    await apiFetch<Blob>(
      `/api/drive/files/${encodeURIComponent(
        fileId
      )}/download/`,
      {
        method: 'GET',
      }
    );

  if (!(blob instanceof Blob)) {
    throw new Error(
      'The server did not return a valid file.'
    );
  }

  return blob;
}

/**
 * Save a Drive file locally.
 *
 * This is the function the UI should use
 * for authenticated downloads.
 */
export async function saveDriveFile(
  fileId: string,
  fileName: string
): Promise<void> {
  const blob =
    await downloadDriveFile(
      fileId
    );

  const objectUrl =
    URL.createObjectURL(blob);

  try {
    const anchor =
      document.createElement('a');

    anchor.href =
      objectUrl;

    anchor.download =
      fileName || 'download';

    document.body.appendChild(
      anchor
    );

    anchor.click();

    anchor.remove();
  } finally {
    setTimeout(() => {
      URL.revokeObjectURL(
        objectUrl
      );
    }, 1000);
  }
}

/**
 * Returns the backend download URL.
 *
 * IMPORTANT:
 * This URL should not be opened directly
 * for authenticated downloads because it
 * does not contain the Authorization header.
 */
export function getDriveDownloadUrl(
  fileId: string
): string {
  const envUrl =
    import.meta.env
      .VITE_API_BASE_URL || '';

  const baseUrl =
    typeof envUrl === 'string'
      ? envUrl.replace(
          /\/+$/,
          ''
        )
      : '';

  return `${baseUrl}/api/drive/files/${encodeURIComponent(
    fileId
  )}/download/`;
}