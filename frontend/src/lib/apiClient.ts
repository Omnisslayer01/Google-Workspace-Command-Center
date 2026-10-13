export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(
    message: string,
    status?: number,
    data?: any
  ) {
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
  constructor(
    message: string = 'Network unavailable / backend offline.'
  ) {
    super(message, 0);
    this.name = 'ApiNetworkError';
  }
}

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (
    envUrl &&
    typeof envUrl === 'string' &&
    envUrl.trim().length > 0
  ) {
    return envUrl.replace(/\/+$/, '');
  }

  return '';
};

/**
 * Prevent multiple requests from refreshing
 * the access token simultaneously.
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresh the application's Django JWT access token.
 *
 * IMPORTANT:
 * This is NOT the Google OAuth refresh token.
 * This refresh token belongs to the frontend/backend
 * authentication system.
 */
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken =
    localStorage.getItem('refresh_token');

  if (!refreshToken) {
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const baseUrl = getBaseUrl();

      const response = await fetch(
        `${baseUrl}/api/auth/refresh/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        }
      );

      if (!response.ok) {
        return null;
      }

      const responseData = await response.json();

      /**
       * Support all response shapes that the backend
       * may return.
       *
       * Standard SimpleJWT:
       * {
       *   access: "...",
       *   refresh: "..."
       * }
       *
       * Wrapped:
       * {
       *   data: {
       *     access: "...",
       *     refresh: "..."
       *   }
       * }
       */
      const newAccessToken =
        responseData?.access ??
        responseData?.data?.access ??
        responseData?.result?.access ??
        null;

      if (
        !newAccessToken ||
        typeof newAccessToken !== 'string'
      ) {
        console.error(
          'Token refresh succeeded but no access token was returned.',
          responseData
        );

        return null;
      }

      /**
       * Save the NEW access token immediately.
       */
      localStorage.setItem(
        'access_token',
        newAccessToken
      );

      /**
       * SimpleJWT may rotate the refresh token.
       *
       * If a new one is returned, replace the old one.
       */
      const newRefreshToken =
        responseData?.refresh ??
        responseData?.data?.refresh ??
        responseData?.result?.refresh ??
        null;

      if (
        newRefreshToken &&
        typeof newRefreshToken === 'string'
      ) {
        localStorage.setItem(
          'refresh_token',
          newRefreshToken
        );
      }

      return newAccessToken;
    } catch (error) {
      console.error(
        'Failed to refresh access token:',
        error
      );

      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Build request headers.
 */
const buildRequestHeaders = (
  options: RequestInit,
  accessToken: string | null
): Headers => {
  const headers = new Headers(options.headers);

  headers.set(
    'Accept',
    'application/json'
  );

  if (accessToken) {
    headers.set(
      'Authorization',
      `Bearer ${accessToken}`
    );
  }

  /**
   * DO NOT manually set Content-Type for FormData.
   *
   * The browser automatically adds:
   *
   * multipart/form-data; boundary=...
   */
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  }

  return headers;
};

/**
 * Parse an API error response safely.
 */
const parseErrorResponse = async (
  response: Response
): Promise<any | null> => {
  try {
    const contentType =
      response.headers.get('content-type') || '';

    if (
      contentType
        .toLowerCase()
        .includes('application/json')
    ) {
      return await response.json();
    }

    const text = await response.text();

    return text || null;
  } catch {
    return null;
  }
};

/**
 * Authenticated API request helper.
 *
 * Features:
 * - Adds JWT Authorization header
 * - Automatically refreshes expired access token
 * - Retries original request exactly once
 * - Supports FormData
 * - Supports JSON
 * - Supports Blob/file downloads
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getBaseUrl();

  const cleanEndpoint =
    endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

  const url =
    `${baseUrl}${cleanEndpoint}`;

  let accessToken =
    localStorage.getItem('access_token');

  /**
   * Perform the actual request.
   */
  const makeRequest = async (
    token: string | null
  ): Promise<Response> => {
    const headers =
      buildRequestHeaders(
        options,
        token
      );

    try {
      return await fetch(
        url,
        {
          ...options,
          headers,
        }
      );
    } catch (error: any) {
      throw new ApiNetworkError(
        error?.message ||
          'Failed to connect to backend server.'
      );
    }
  };

  /**
   * First request.
   */
  let response =
    await makeRequest(accessToken);

  /**
   * -------------------------------------------------------
   * ACCESS TOKEN EXPIRED
   * -------------------------------------------------------
   *
   * Backend returns:
   *
   * 401
   * token_not_valid
   * Token is expired
   *
   * Refresh and retry exactly once.
   */
  if (
    response.status === 401 &&
    accessToken
  ) {
    const newAccessToken =
      await refreshAccessToken();

    if (newAccessToken) {
      /**
       * VERY IMPORTANT:
       *
       * Use the freshly returned token,
       * not the old token from localStorage.
       */
      accessToken = newAccessToken;

      /**
       * Retry the original request once.
       */
      response =
        await makeRequest(
          accessToken
        );
    } else {
      /**
       * Refresh token itself is invalid/expired.
       *
       * User must authenticate again.
       */
      const errorData =
        await parseErrorResponse(
          response
        );

      localStorage.removeItem(
        'access_token'
      );

      localStorage.removeItem(
        'refresh_token'
      );

      window.location.assign('/');

      throw new ApiAuthError(
        'Your session has expired. Please sign in again.',
        401,
        errorData
      );
    }
  }

  /**
   * Authentication / authorization errors.
   */
  if (
    response.status === 401 ||
    response.status === 403
  ) {
    const errorData =
      await parseErrorResponse(
        response
      );

    const message =
      errorData?.detail ||
      errorData?.error?.detail ||
      (
        typeof errorData?.error === 'string'
          ? errorData.error
          : undefined
      ) ||
      'Google Workspace authorization required. Please authenticate again.';

    throw new ApiAuthError(
      message,
      response.status,
      errorData
    );
  }

  /**
   * Other API errors.
   */
  if (!response.ok) {
    const errorData =
      await parseErrorResponse(
        response
      );

    const message =
      errorData?.detail ||
      errorData?.error?.detail ||
      (
        typeof errorData?.error === 'string'
          ? errorData.error
          : undefined
      ) ||
      (
        typeof errorData === 'string'
          ? errorData
          : undefined
      ) ||
      `Request failed with status ${response.status}: ${response.statusText}`;

    throw new ApiError(
      message,
      response.status,
      errorData
    );
  }

  /**
   * 204 No Content.
   */
  if (response.status === 204) {
    return {} as T;
  }

  /**
   * Detect binary/file responses.
   */
  const contentType =
    response.headers.get(
      'content-type'
    ) || '';

  const lowerContentType =
    contentType.toLowerCase();

  if (
    lowerContentType.includes(
      'application/octet-stream'
    ) ||
    lowerContentType.includes(
      'application/pdf'
    ) ||
    lowerContentType.includes(
      'application/zip'
    ) ||
    lowerContentType.includes(
      'application/vnd'
    ) ||
    lowerContentType.startsWith(
      'image/'
    ) ||
    lowerContentType.startsWith(
      'video/'
    ) ||
    lowerContentType.startsWith(
      'audio/'
    )
  ) {
    return (
      await response.blob()
    ) as T;
  }

  /**
   * Normal JSON response.
   */
  if (
    lowerContentType.includes(
      'application/json'
    )
  ) {
    return (
      await response.json()
    ) as T;
  }

  /**
   * Fallback for responses where Django
   * doesn't provide a proper Content-Type.
   */
  const text =
    await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(
      text
    ) as T;
  } catch {
    return text as T;
  }
}