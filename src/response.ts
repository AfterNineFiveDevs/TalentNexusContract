/** Metadata returned with a paginated result. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** A validation or domain error attached to an API error response. */
export interface ApiErrorDetail {
  /** A stable, application-defined error code. */
  code: string;
  /** Human-readable explanation of the error. */
  message: string;
  /** Optional field or property that caused the error. */
  field?: string;
}

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
  errors?: ApiErrorDetail[];
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
