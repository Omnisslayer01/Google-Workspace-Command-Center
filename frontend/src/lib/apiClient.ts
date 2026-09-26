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

/**
 * Prevent multiple API requests from trying to refresh
 * the same JWT at the same time.
 */
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const baseUrl = getBaseUrl();

      const response = await fetch(`${baseUrl}/api/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      const newAccessToken = data?.access;

      if (!newAccessToken) {
        return null;
      }

      localStorage.setItem('access_token', newAccessToken);

      // ROTATE_REFRESH_TOKENS is enabled on the backend.
      // Store the new refresh token when one is returned.
      if (data?.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }

      return newAccessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const buildRequestHeaders = (
  options: RequestInit,
  accessToken: string | null
): Headers => {
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
};

const parseErrorResponse = async (
  response: Response
): Promise<any | null> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
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

  let accessToken = localStorage.getItem('access_token');

  const makeRequest = async (
    token: string | null
  ): Promise<Response> => {
    const headers = buildRequestHeaders(options, token);

    try {
      return await fetch(url, {
        ...options,
        headers,
      });
    } catch (err: any) {
      throw new ApiNetworkError(
        err?.message || 'Failed to connect to backend server'
      );
    }
  };

  let response = await makeRequest(accessToken);

  /*
   * If the JWT access token expired, refresh it automatically
   * and retry the original request once.
   */
  if (response.status === 401 && accessToken) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      accessToken = newAccessToken;

      // Retry the original request exactly once
      // with the refreshed access token.
      response = await makeRequest(accessToken);
    } else {
      const errorData = await parseErrorResponse(response);

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      window.location.assign('/');

      throw new ApiAuthError(
        'Your session has expired. Please sign in again.',
        401,
        errorData
      );
    }
  }

  // Authentication / authorization errors.
  if (response.status === 401 || response.status === 403) {
    const errorData = await parseErrorResponse(response);

    const message =
      errorData?.detail ||
      errorData?.error ||
      'Google Workspace authorization required. Please authenticate via BE1 Google OAuth.';

    throw new ApiAuthError(message, response.status, errorData);
  }

  // Other API errors.
  if (!response.ok) {
    const errorData = await parseErrorResponse(response);

    const message =
      errorData?.detail ||
      errorData?.error?.detail ||
      (typeof errorData?.error === 'string'
        ? errorData.error
        : undefined) ||
      `Request failed with status ${response.status}: ${response.statusText}`;

    throw new ApiError(message, response.status, errorData);
  }

  // No content response.
  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}