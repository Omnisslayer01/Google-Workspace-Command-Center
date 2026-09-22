export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class ApiAuthError extends ApiError {
  constructor(message: string = 'Google Calendar authorization is required or has expired.', status: number = 401, data?: any) {
    super(message, status, data);
    this.name = 'ApiAuthError';
  }
}

export class ApiNetworkError extends ApiError {
  constructor(message: string = 'Network unavailable / backend offline.') {
    super(message, 0);
    this.name = 'ApiNetworkError';
  }
}

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }
  return '';
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    // Network fetch failure (e.g. backend server not running / connection refused)
    throw new ApiNetworkError(err?.message || 'Failed to connect to backend server');
  }

  // Check 401 / 403 authorization specifically
  if (response.status === 401 || response.status === 403) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      // ignore
    }
    const msg =
      errorData?.detail ||
      errorData?.error ||
      'Google Workspace authorization required. Please authenticate via BE1 Google OAuth.';
    throw new ApiAuthError(msg, response.status, errorData);
  }

  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      // ignore
    }
    const msg =
      errorData?.detail ||
      errorData?.message ||
      `Request failed with status ${response.status}: ${response.statusText}`;
    throw new ApiError(msg, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}
