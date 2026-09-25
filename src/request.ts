import type { ZodType } from 'zod';

/** Runtime DTO classes expose a Zod schema for Nest's global validation pipe. */
export interface ZodDtoClass<TOutput = unknown> {
  readonly schema: ZodType<TOutput>;
}

/** Values accepted in URL query parameters. */
export type QueryValue = string | number | boolean | null | undefined;

/** A serializable set of URL query parameters. */
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;

/** Common paging parameters for list endpoints. */
export interface PaginationQuery {
  /** One-based page number. */
  page?: number;
  /** Maximum number of records returned in a page. */
  limit?: number;
}

export type SortDirection = "asc" | "desc";

/** Common sorting parameters for list endpoints. */
export interface SortQuery<TField extends string = string> {
  sortBy?: TField;
  sortOrder?: SortDirection;
}

/** Common search parameter for list endpoints. */
export interface SearchQuery {
  search?: string;
}

/**
 * A reusable request shape for clients which keep path, query, and body data
 * separate. Endpoint-specific request types can extend this interface.
 */
export interface ApiRequest<
  TParams extends Record<string, string> = Record<string, string>,
  TQuery extends QueryParams = QueryParams,
  TBody = unknown,
> {
  params?: TParams;
  query?: TQuery;
  body?: TBody;
}
