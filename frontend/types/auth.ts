// ─── Auth request / response shapes ────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthUser {
  id: number;
  email: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: AuthUser;
}

export interface RegisterResponse {
  tokens: AuthTokens;
  user: AuthUser;
}

export interface GoogleOAuthUrlResponse {
  auth_url: string;
}

// Generic API error shape returned by DRF
export interface ApiError {
  detail?: string;
  [field: string]: string | string[] | undefined;
}
