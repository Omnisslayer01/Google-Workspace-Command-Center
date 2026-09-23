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
  constructor(
    message: string = 'Google Workspace authorization is required or has expired.',
    status: number = 401,
    data?: any
  ) {
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

  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const url = `${baseUrl}${cleanEndpoint}`;

  const accessToken = localStorage.getItem('access_token');

  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');

  // Send JWT for authenticated backend endpoints.
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // JSON requests need Content-Type.
  // FormData requests must NOT have Content-Type manually set because
  // the browser adds the correct multipart boundary automatically.
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiNetworkError(
      err?.message || 'Failed to connect to backend server'
    );
  }

  // Authentication / authorization errors.
  if (response.status === 401 || response.status === 403) {
    let errorData: any = null;

    try {
      errorData = await response.json();
    } catch {
      // Ignore invalid/non-JSON error responses.
    }

    const message =
      errorData?.detail ||
      errorData?.error ||
      'Google Workspace authorization required. Please authenticate via BE1 Google OAuth.';

    throw new ApiAuthError(message, response.status, errorData);
  }

  // Other API errors.
  if (!response.ok) {
    let errorData: any = null;

    try {
      errorData = await response.json();
    } catch {
      // Ignore invalid/non-JSON error responses.
    }

    const message =
      errorData?.detail ||
      errorData?.error?.detail ||
      (typeof errorData?.error === 'string' ? errorData.error : undefined) ||
      'Google Workspace authorization required. Please authenticate via BE1 Google OAuth.';

    throw new ApiError(message, response.status, errorData);
  }

  // No content response.
  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}