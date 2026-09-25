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
