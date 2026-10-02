/** Metadata returned with a paginated result. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Field-specific validation messages keyed by dot-notated request paths. */
export type ApiFieldErrors = Record<string, string>;

/** Stable API error messages that clients may use for response handling. */
export const API_ERROR_MESSAGES = {
  BAD_REQUEST: 'Bad request',
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized',
  INVALID_CREDENTIALS: 'Invalid username or password',
  JWT_EXPIRED: 'JWT expired',
  JWT_INVALID: 'Invalid JWT',
  REFRESH_TOKEN_INVALID: 'Invalid refresh token',
  REFRESH_TOKEN_EXPIRED: 'Refresh token expired',
  REFRESH_TOKEN_REUSED: 'Refresh token reused',
  SESSION_REVOKED: 'Session revoked',
  EMAIL_VERIFICATION_TOKEN_INVALID: 'Invalid email verification token',
  EMAIL_VERIFICATION_TOKEN_EXPIRED: 'Email verification token expired',
  PASSWORD_RESET_TOKEN_INVALID: 'Invalid password reset token',
  PASSWORD_RESET_TOKEN_EXPIRED: 'Password reset token expired',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not found',
  CONFLICT: 'Conflict',
  SERVICE_NOT_READY: 'Service not ready',
  INTERNAL_SERVER_ERROR: 'Internal server error',
} as const;

/** Stable API success messages that clients may use for response handling. */
export const API_SUCCESS_MESSAGES = {
  EMAIL_VERIFICATION_SENT:
    'If the account is eligible, a verification email has been sent',
  EMAIL_VERIFIED: 'Email verified',
  PASSWORD_RESET_EMAIL_SENT:
    'If an account exists, a password reset email has been sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
} as const;

export type ApiSuccessMessage =
  (typeof API_SUCCESS_MESSAGES)[keyof typeof API_SUCCESS_MESSAGES];

export type ApiErrorMessage =
  (typeof API_ERROR_MESSAGES)[keyof typeof API_ERROR_MESSAGES];

/** Successful API envelope. */
export interface ApiSuccessResponse<TData> {
  success: true;
  data: TData;
  message?: string;
}

/** Failed API envelope. */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiFieldErrors;
}

/** Standard API response envelope. */
export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;

/** Standard response envelope for a paginated collection. */
export interface ApiPaginatedResponse<TData> {
  success: true;
  data: TData[];
  meta: PaginationMeta;
  message?: string;
}
