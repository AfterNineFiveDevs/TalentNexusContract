import { z } from "zod";

export const jobStatusSchema = z.enum([
  "PENDING",
  "PUBLISHED",
  "REJECTED",
  "CLOSED",
]);

export const adminJobsQuerySchema = z.object({
  deletion: z.enum(["active", "deleted", "all"]).default("active"),
  location: z.string().trim().min(1).max(200).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  companyName: z.string().trim().min(1).max(200).optional(),
  sourceId: z.string().trim().min(1).max(100).optional(),
  status: jobStatusSchema.optional(),

  page: z.coerce.number().int().min(1).max(2_147_483_647).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  sortBy: z
    .enum([
      "createdAt",
      "updatedAt",
      "lastSeenAt",
      "publishedAt",
      "title",
      "companyName",
    ])
    .default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type AdminJobsQuery = z.infer<typeof adminJobsQuerySchema>;

export interface AdminJobsQueryDto extends AdminJobsQuery {}

export class AdminJobsQueryDto {
  static readonly schema = adminJobsQuerySchema;
}

export type JobStatus = z.infer<typeof jobStatusSchema>;
export const jobAdminActionSchema = z.enum([
  "CREATE",
  "EDIT",
  "PUBLISH",
  "REJECT",
  "CLOSE",
  "REOPEN",
  "DELETE",
  "RESTORE",
]);
export type JobAdminAction = z.infer<typeof jobAdminActionSchema>;

const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .url()
  .refine((value) => {
    return /^https?:\/\//i.test(value);
  }, "Only HTTP and HTTPS URLs are allowed");

export const jobContentSchema = z.strictObject({
  title: z.string().trim().min(1).max(200),
  companyName: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(100_000),
  location: z.string().trim().min(1).max(200),
  sourceUrl: httpUrl,
  applicationUrl: z.array(httpUrl).max(20),
});
export type JobContent = z.infer<typeof jobContentSchema>;
export const jobContentPatchSchema = jobContentSchema
  .partial()
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    "Provide at least one content field",
  );
export type JobContentPatch = z.infer<typeof jobContentPatchSchema>;

const note = z.string().trim().min(1).max(2000);
const expectedVersion = z.number().int().min(0).max(2_147_483_646);
export const createAdminJobSchema = jobContentSchema.extend({
  applicationUrl: z.array(httpUrl).max(20).default([]),
  note: note.optional(),
});
export const updateAdminJobSchema = z.strictObject({
  expectedVersion,
  content: jobContentPatchSchema,
  note: note.optional(),
});
export const adminJobActionRequestSchema = z.strictObject({
  expectedVersion,
  note: note.optional(),
});
export const adminJobReasonRequestSchema = adminJobActionRequestSchema.extend({
  note,
});
export const publishAdminJobSchema = adminJobActionRequestSchema.extend({
  content: jobContentPatchSchema.optional(),
});
export const jobIdParamsSchema = z.strictObject({ id: z.uuid() });

export type CreateAdminJobRequest = z.infer<typeof createAdminJobSchema>;
export type UpdateAdminJobRequest = z.infer<typeof updateAdminJobSchema>;
export type AdminJobActionRequest = z.infer<typeof adminJobActionRequestSchema>;
export type AdminJobReasonRequest = z.infer<typeof adminJobReasonRequestSchema>;
export type PublishAdminJobRequest = z.infer<typeof publishAdminJobSchema>;

export interface CreateAdminJobDto extends CreateAdminJobRequest {}
export class CreateAdminJobDto {
  static readonly schema = createAdminJobSchema;
}
export interface UpdateAdminJobDto extends UpdateAdminJobRequest {}
export class UpdateAdminJobDto {
  static readonly schema = updateAdminJobSchema;
}
export interface AdminJobActionDto extends AdminJobActionRequest {}
export class AdminJobActionDto {
  static readonly schema = adminJobActionRequestSchema;
}
export interface AdminJobReasonDto extends AdminJobReasonRequest {}
export class AdminJobReasonDto {
  static readonly schema = adminJobReasonRequestSchema;
}
export interface PublishAdminJobDto extends PublishAdminJobRequest {}
export class PublishAdminJobDto {
  static readonly schema = publishAdminJobSchema;
}
export interface JobIdParamsDto extends z.infer<typeof jobIdParamsSchema> {}
export class JobIdParamsDto {
  static readonly schema = jobIdParamsSchema;
}

// Timestamp strings are serialized by the API, not JavaScript Date objects.
export interface AdminJobSummary {
  id: string;
  title: string;
  companyName: string;
  location: string;
  sourceId: string;
  sourceUrl: string;
  status: JobStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
  publishedAt: string | null;
  deletedAt: string | null;
}
export interface AdminJobDetail extends AdminJobSummary {
  externalId: string;
  description: string;
  applicationUrl: readonly string[];
  reviewedById: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  closedAt: string | null;
  adminEditedAt: string | null;
  lastAdminAction: JobAdminAction | null;
  lastAdminActionById: string | null;
  lastAdminActionAt: string | null;
  lastAdminActionNote: string | null;
}

export const adminJobSummarySchema = z.object({
  id: z.uuid(),
  title: z.string(),
  companyName: z.string(),
  location: z.string(),
  sourceId: z.string(),
  sourceUrl: z.string(),
  status: jobStatusSchema,
  version: z.number().int().min(0),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastSeenAt: z.string(),
  publishedAt: z.string().nullable(),
  deletedAt: z.string().nullable(),
}) satisfies z.ZodType<AdminJobSummary>;
export const adminJobDetailSchema = adminJobSummarySchema.extend({
  externalId: z.string(),
  description: z.string(),
  applicationUrl: z.array(z.string()),
  reviewedById: z.uuid().nullable(),
  reviewedAt: z.string().nullable(),
  reviewNote: z.string().nullable(),
  closedAt: z.string().nullable(),
  adminEditedAt: z.string().nullable(),
  lastAdminAction: jobAdminActionSchema.nullable(),
  lastAdminActionById: z.uuid().nullable(),
  lastAdminActionAt: z.string().nullable(),
  lastAdminActionNote: z.string().nullable(),
}) satisfies z.ZodType<AdminJobDetail>;
