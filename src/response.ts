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
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not found',
  CONFLICT: 'Conflict',
  SERVICE_NOT_READY: 'Service not ready',
  INTERNAL_SERVER_ERROR: 'Internal server error',
} as const;

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
