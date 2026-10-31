# TalentNexus frontend contract guide

Use this package for the request types, runtime validation schemas, and response
types shared by the frontend and TalentNexusAPI. Expand the sections below for
the screen or action you are developing.

This guide describes the repository's current source. New exports are available
to consumers only after a matching package release is installed. The admin jobs
API also requires its database migration to be deployed before use.

<details open>
<summary><strong>Start here: imports, types, schemas, and DTOs</strong></summary>

Install the contracts release matching the API environment. Development releases
use the `dev` dist-tag; see [GITFLOW.md](./GITFLOW.md) for release channels.

```typescript
// Runtime values: validation, normalization, and defaults.
import { createAdminJobSchema, Role } from "@talent-nexus/contracts";

// Types: compile-time checking, with no runtime validation.
import type {
  CreateAdminJobRequest,
  AdminJobDetail,
  ApiResponse,
} from "@talent-nexus/contracts";
```

| Export kind   | Frontend use                                             | Example                 |
| ------------- | -------------------------------------------------------- | ----------------------- |
| Request type  | API-client function arguments after validation           | `CreateAdminJobRequest` |
| Zod schema    | Form validation, parsing URL state, validating responses | `createAdminJobSchema`  |
| Response type | Typed API results and component props                    | `AdminJobDetail`        |
| Enum          | Role checks and display mappings                         | `Role.Admin`            |
| `*Dto` class  | Primarily NestJS backend validation/Swagger              | `CreateAdminJobDto`     |

Frontend forms should usually use schemas and request types rather than
instantiating DTO classes. A type annotation or `as SomeType` does not validate
data at runtime; use `.parse()` or `.safeParse()` when validation is needed.

Schemas can coerce, trim, and supply defaults, so raw form input may differ from
the parsed request type:

```typescript
import { z } from "zod";
import { createAdminJobSchema } from "@talent-nexus/contracts";

type CreateJobFormValues = z.input<typeof createAdminJobSchema>;

const formValues: CreateJobFormValues = {
  title: "Accountant",
  companyName: "Example Company",
  description: "Prepare monthly accounts.",
  location: "Yangon",
  sourceUrl: "https://example.com/jobs/1",
};

// The parsed result has applicationUrl: [], even though the form omitted it.
const request = createAdminJobSchema.parse(formValues);
```

</details>

<details>
<summary><strong>Shared API envelopes and error handling</strong></summary>

| Export                    | Use                                                        |
| ------------------------- | ---------------------------------------------------------- |
| `ApiResponse<T>`          | Single-resource success or error                           |
| `ApiSuccessResponse<T>`   | Successful single-resource response only                   |
| `ApiErrorResponse`        | Error body: `success: false`, `message`, optional `errors` |
| `ApiPaginatedResponse<T>` | Successful list: `data: T[]` and `meta`                    |
| `PaginationMeta`          | Page, limit, total, totalPages, next/previous flags        |
| `ApiFieldErrors`          | Field messages keyed by paths such as `content.title`      |
| `API_ERROR_MESSAGES`      | Shared stable error-message constants                      |
| `API_SUCCESS_MESSAGES`    | Shared stable success-message constants                    |

```typescript
import type {
  AdminJobDetail,
  AdminJobSummary,
  ApiResponse,
  ApiPaginatedResponse,
  ApiErrorResponse,
} from "@talent-nexus/contracts";

type JobResult = ApiResponse<AdminJobDetail>;
type JobListResult = ApiPaginatedResponse<AdminJobSummary> | ApiErrorResponse;
```

Successful detail/mutation responses have `{ success: true, data: job }`.
Successful lists have `{ success: true, data: jobs, meta }`. Do not wrap a
paginated envelope inside `ApiResponse` again.

Check `response.ok`/HTTP status and `payload.success` before using `data`.
Validation errors use `errors` for individual form fields. Unknown-field errors
may appear at the root path. Do not assume every error message has a constant:
some job lifecycle errors have descriptive messages.

| Status | Frontend handling                                                   |
| ------ | ------------------------------------------------------------------- |
| `400`  | Show validation feedback; retain the user's edits                   |
| `401`  | Use the existing refresh/sign-in flow                               |
| `403`  | Show insufficient permissions                                       |
| `404`  | Show job not found                                                  |
| `409`  | Refresh the job; review changed content/status before retrying      |
| `500`  | Show a recoverable error; do not report the operation as successful |

</details>

<details>
<summary><strong>Authentication screens: which schema and type?</strong></summary>

Paths below are relative to `/api/v1`.

| Screen/action       | Route                            | Schema                            | Request type                |
| ------------------- | -------------------------------- | --------------------------------- | --------------------------- |
| Sign up             | `POST /auth/signup`              | `signupRequestSchema`             | `SignUpRequest`             |
| Sign in             | `POST /auth/login`               | `loginRequestSchema`              | `LoginRequest`              |
| Google sign-in      | `POST /auth/google`              | `googleAuthRequestSchema`         | `GoogleAuthRequest`         |
| Verify email link   | `POST /auth/verify-email`        | `verifyEmailRequestSchema`        | `VerifyEmailRequest`        |
| Resend verification | `POST /auth/verify-email/resend` | `resendVerificationRequestSchema` | `ResendVerificationRequest` |
| Forgot password     | `POST /auth/forgot-password`     | `forgotPasswordRequestSchema`     | `ForgotPasswordRequest`     |
| Reset password      | `POST /auth/reset-password`      | `resetPasswordRequestSchema`      | `ResetPasswordRequest`      |
| Refresh session     | `POST /auth/refresh`             | No request-body schema            | Cookie-based                |
| Sign out            | `POST /auth/logout`              | No request-body schema            | Cookie-based                |
| Sign out everywhere | `POST /auth/logout-all`          | No request-body schema            | Bearer authentication       |
| Current user        | `GET /auth/profile`              | No request body                   | Bearer authentication       |

- Sign-up fields are `username`, `email`, `password`, and `confirmPassword`.
  The current exported schema does not include a terms-acceptance field.
  Use `SignUpRequest`, not the older, incomplete
  `SignUpUserRequest` interface.
- Google sign-in sends `{ credential }`, containing the Google ID credential.
- Verification sends `{ token }`; reset-password sends `{ token, password,
confirmPassword }`.
- Sign-up returns `ApiResponse<AuthenticatedUser>`; login and Google sign-in
  return `ApiResponse<LoginResponse>`.
- Refresh returns `ApiResponse<RefreshResponse>`; `refreshResponseSchema` is
  equivalent to `loginResponseSchema`.
- `LoginResponse` contains `access_token`, `id`, `email`, and `role`.
  `authenticatedUserSchema`/`AuthenticatedUser` describe identity without the token.
- Successful email-verification, resend, forgot-password, and reset-password
  actions return an envelope with `data: null` and a message. Logout operations
  return `204`; do not unconditionally call `.json()` on them.
- Include cookies using `credentials: 'include'` where the session flow needs
  them. The refresh token is an HTTP-only cookie, not a response-body field.
- Use `Role.Admin`, `Role.Talent`, and `Role.Recruiter`; their wire values are
  `ADMIN`, `TALENT`, and `RECRUITER`. UI role checks do not replace API authorization.

Reusable form primitives: `emailSchema`, `passwordSchema`. Prefer the full
screen schema when available, since it includes cross-field checks.

</details>

<details>
<summary><strong>Admin jobs: list filters, sorting, and pagination</strong></summary>

Route: `GET /api/v1/admin/jobs`. Requires an admin bearer token.

Use `adminJobsQuerySchema` to validate URL/filter state and `AdminJobsQuery` for
the parsed query. Use `AdminJobSummary` for table rows.

| Query                              | Behavior/default                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| `title`, `companyName`, `location` | Optional case-insensitive literal contains                                              |
| `sourceId`, `status`               | Optional exact match                                                                    |
| `deletion`                         | `active` (default), `deleted`, `all`                                                    |
| `page`                             | One-based; default `1`                                                                  |
| `limit`                            | Default `20`; minimum `1`, maximum `100`                                                |
| `sortBy`                           | `createdAt` (default), `updatedAt`, `lastSeenAt`, `publishedAt`, `title`, `companyName` |
| `sortOrder`                        | `desc` (default), `asc`                                                                 |

All provided filters combine with AND. Omit empty text filters rather than
sending empty strings. `sourceId` is the source identifier, such as `myjobs` or
`manual`; it is not a company name. Parameter names are case-sensitive: use
`companyName` and `sourceId` exactly.

```typescript
import { adminJobsQuerySchema } from "@talent-nexus/contracts";

const query = adminJobsQuerySchema.parse({
  title: "accountant",
  status: "PENDING",
  page: "1",
  limit: "20",
  sortBy: "createdAt",
  sortOrder: "asc",
});

const search = new URLSearchParams();
for (const [key, value] of Object.entries(query)) {
  if (value !== undefined) search.set(key, String(value));
}
// Append `?${search}` to the endpoint URL.
```

The list is `ApiPaginatedResponse<AdminJobSummary>` on success. `meta.total`
counts all matching rows, not just the current page. An out-of-range page returns
an empty array and retains the requested page; no matches produce `totalPages: 0`.
ID breaks sorting ties. Publication timestamps can be null; the current API uses
PostgreSQL's null ordering (first for descending, last for ascending).

</details>

<details>
<summary><strong>Admin jobs: detail and response validation</strong></summary>

Route: `GET /api/v1/admin/jobs/:id`.

| Export                                      | Use                                     |
| ------------------------------------------- | --------------------------------------- |
| `AdminJobSummary` / `adminJobSummarySchema` | List-table row                          |
| `AdminJobDetail` / `adminJobDetailSchema`   | Detail page and mutation result         |
| `JobStatus` / `jobStatusSchema`             | Status filters and badges               |
| `JobAdminAction` / `jobAdminActionSchema`   | Latest admin-action label               |
| `jobIdParamsSchema`                         | Validate `{ id }` from route parameters |

Detail includes summary fields plus `externalId`, `description`, `applicationUrl`,
review information, `closedAt`, `adminEditedAt`, and latest-action metadata.
The detail endpoint includes deleted jobs so admins can inspect and restore them.

```typescript
import { z } from "zod";
import { adminJobDetailSchema } from "@talent-nexus/contracts";

const successSchema = z.object({
  success: z.literal(true),
  data: adminJobDetailSchema,
  message: z.string().optional(),
});

// After checking the HTTP response is successful:
// const { data: job } = successSchema.parse(await response.json());
```

The exported job schemas validate the job object, not the outer API envelope.
Timestamp fields are strings, with nullable fields represented by `null`.
Response schemas currently check timestamp strings as strings, not ISO formats.
`applicationUrl` on the detail type is readonly; copy it before editing a form:

```typescript
// const editableUrls = [...job.applicationUrl];
```

</details>

<details>
<summary><strong>Admin jobs: create and edit forms</strong></summary>

| Action                  | Route                          | Schema                  | Request type            |
| ----------------------- | ------------------------------ | ----------------------- | ----------------------- |
| Create                  | `POST /api/v1/admin/jobs`      | `createAdminJobSchema`  | `CreateAdminJobRequest` |
| Edit                    | `PATCH /api/v1/admin/jobs/:id` | `updateAdminJobSchema`  | `UpdateAdminJobRequest` |
| Shared complete content | —                              | `jobContentSchema`      | `JobContent`            |
| Shared partial content  | —                              | `jobContentPatchSchema` | `JobContentPatch`       |

Create sends content fields at the top level. Edit puts changed content inside
`content`. Both allow an optional `note`.

```typescript
import { updateAdminJobSchema } from "@talent-nexus/contracts";

const request = updateAdminJobSchema.parse({
  expectedVersion: 2, // Use the version returned by the latest detail/mutation.
  content: { title: "Senior Accountant", location: "Yangon" },
  note: "Corrected the title after checking the source",
});
```

| Content field                      | Validation                                               |
| ---------------------------------- | -------------------------------------------------------- |
| `title`, `companyName`, `location` | Trimmed, nonblank, maximum 200 characters                |
| `description`                      | Trimmed, nonblank, maximum 100,000 characters            |
| `sourceUrl`                        | Required HTTP(S) URL, maximum 2,048 characters           |
| `applicationUrl`                   | Maximum 20 HTTP(S) URLs, each maximum 2,048 characters   |
| `note`                             | If provided, trimmed, nonblank, maximum 2,000 characters |

Create defaults `applicationUrl` to `[]`; `jobContentSchema` itself requires the
array. An edit patch must contain at least one editable field. Mutation schemas
reject unknown fields, including status, source identity, actors, and timestamps.
Do not submit the entire detail response as an edit payload.

Manual jobs start PENDING. Source identity is generated by the API. Edits preserve
status, including immediate updates to published jobs. Once an admin edits content,
later crawls cannot overwrite it. The current API has no reset-protection action.

</details>

<details>
<summary><strong>Admin jobs: publish, reject, close, reopen, delete, restore</strong></summary>

Every body requires numeric `expectedVersion` from the last returned job.
All paths below are relative to `/api/v1/admin/jobs/:id`.

| Action  | Method/path     | Schema                        | Type                     | Allowed state       |
| ------- | --------------- | ----------------------------- | ------------------------ | ------------------- |
| Publish | `POST /publish` | `publishAdminJobSchema`       | `PublishAdminJobRequest` | PENDING             |
| Reject  | `POST /reject`  | `adminJobReasonRequestSchema` | `AdminJobReasonRequest`  | PENDING             |
| Close   | `POST /close`   | `adminJobActionRequestSchema` | `AdminJobActionRequest`  | PUBLISHED           |
| Reopen  | `POST /reopen`  | `adminJobActionRequestSchema` | `AdminJobActionRequest`  | REJECTED or CLOSED  |
| Delete  | `DELETE /`      | `adminJobReasonRequestSchema` | `AdminJobReasonRequest`  | Any non-deleted job |
| Restore | `POST /restore` | `adminJobActionRequestSchema` | `AdminJobActionRequest`  | Deleted job         |

Rejection and deletion require `note`; other actions accept an optional note.
Delete targets `/:id` itself (no additional `/delete` segment), includes a JSON
request body, and performs recoverable soft deletion rather than permanent removal.

Publish may include a `content` patch, applying final edits and publication in one
operation. The resulting full content must be valid. An empty application URL list
is allowed; the source page is the apply-out fallback.

```typescript
import {
  publishAdminJobSchema,
  adminJobReasonRequestSchema,
} from "@talent-nexus/contracts";

const publishBody = publishAdminJobSchema.parse({
  expectedVersion: 3,
  content: { title: "Approved job title" },
  note: "Reviewed against source",
});

const rejectBody = adminJobReasonRequestSchema.parse({
  expectedVersion: 3,
  note: "Duplicate listing",
});
```

Reopen and restore return the job to PENDING and clear `closedAt`; neither publishes
automatically. The first `publishedAt` is preserved. Deleted jobs allow only restore.
Use `deletedAt !== null` to identify deletion; `status` alone does not tell you that
a job is deleted. There are no bulk-action or permanent-deletion routes.

All successful actions return `ApiResponse<AdminJobDetail>` with HTTP 200.
Creation returns the same envelope shape with HTTP 201.

</details>

<details>
<summary><strong>Admin jobs: version conflicts and UI state</strong></summary>

Keep the `version` from the fetched detail or latest mutation response in editor
state. All mutations except create require it as `expectedVersion`; do not increment
it locally or substitute a timestamp.

On success, replace local job state with the returned detail, including its new
version. On HTTP 409, preserve unsaved form values, fetch fresh detail, and let the
admin review the changes before retrying. Do not automatically retry with a newer
version, since that can overwrite another admin's edits.

Content updates from ingestion can advance version; freshness-only observations
do not. State transitions can also cause conflicts. Client-side button visibility
is a convenience; the API enforces permissions, state, and version conditions.

`lastAdminAction*` describes only the latest action. It is not a history feed.
`reviewedById`, `reviewedAt`, and `reviewNote` describe the latest review decision.
Admin approval does not mean employer verification.

</details>

<details>
<summary><strong>Generic helpers and enum values</strong></summary>

`PaginationQuery`, `SortQuery`, `SearchQuery`, `QueryParams`, `QueryValue`,
`SortDirection`, and `ApiRequest` are generic TypeScript helpers. Use an
endpoint-specific schema when one exists: generic `SearchQuery.search`, for example,
does not mean the admin jobs endpoint accepts a `search` parameter.

`SignUpMethod` describes email/Google/LinkedIn identity-method values. Its existence
does not imply all provider integrations are implemented. Currently this guide
documents email/password and Google routes; there is no LinkedIn route to call.

`ZodDtoClass` is the backend interface for classes exposing a static `.schema`.
It is generally unnecessary in frontend code.

</details>

<details>
<summary><strong>gRPC exports: crawler/backend use, not browser requests</strong></summary>

The separate `@talent-nexus/contracts/grpc` entry point exports:

- `ScrapedJobType`, `IngestJobsRequestType`, `IngestJobsResponseType`: transport types.
- `ScrapedJob`, `IngestJobsRequest`, `IngestJobsResponse`: generated protobuf codecs.

These describe crawler-to-API ingestion, not the frontend admin resource.
Use `AdminJobSummary`/`AdminJobDetail` for admin screens. A scraped job has no
database ID, review state, or optimistic-lock version, and cannot replace those
response types.

</details>

## Sources and updates

- [Job contracts](./src/job.ts)
- [Authentication contracts](./src/auth.ts)
- [Response envelopes](./src/response.ts)
- [Generic request helpers](./src/request.ts)
- [Root exports](./src/index.ts)

Update this guide alongside changed exports or endpoint behavior. Deployment timing
and published versions are environment-specific; check the installed package and
the API's deployed Swagger documentation when integrating.
