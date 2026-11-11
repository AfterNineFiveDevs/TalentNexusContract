import { z } from 'zod';

const crawlerHttpUrl = z
  .url()
  .max(2048)
  .refine((v) => ['http:', 'https:'].includes(new URL(v).protocol));
export const crawlerScrapedJobSchema = z
  .object({
    externalId: z.string().trim().min(1).max(500),
    sourceUrl: crawlerHttpUrl,
    title: z.string().trim().min(1).max(500),
    companyName: z.string().trim().min(1).max(500),
    description: z.string().trim().min(1).max(100000),
    location: z.string().trim().min(1).max(500),
    applicationUrl: z.array(crawlerHttpUrl).max(20).default([]),
  })
  .strict();

export const crawlerScheduleSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('weekly'),
      weekdays: z
        .array(z.number().int().min(0).max(6))
        .min(1)
        .max(7)
        .refine((v) => new Set(v).size === v.length),
      time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    })
    .strict(),
  z
    .object({
      kind: z.literal('interval'),
      hours: z.number().int().min(1).max(720),
    })
    .strict(),
]);
export const crawlerTimezoneSchema = z
  .string()
  .max(100)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat('en', { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, 'Use an IANA timezone');
export const updateCrawlerSourceSchema = z
  .object({
    expectedVersion: z.number().int().min(0).max(2_147_483_646),
    enabled: z.boolean().optional(),
    schedule: crawlerScheduleSchema.optional(),
    timezone: crawlerTimezoneSchema.optional(),
    pageLimit: z.number().int().min(1).max(100).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 1, 'Supply a configuration change');
export const crawlerPaginationSchema = z
  .object({
    page: z.coerce.number().int().min(1).max(1_000_000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
export const crawlerSourceParamsSchema = z.object({
  sourceId: z.literal('myjobs'),
});
export const crawlerRunParamsSchema = crawlerSourceParamsSchema.extend({
  runId: z.uuid(),
});
export const crawlerRunStatusSchema = z.enum([
  'QUEUED',
  'RUNNING',
  'SUCCEEDED',
  'PARTIAL',
  'FAILED',
  'ABANDONED',
]);
export const crawlerCountsSchema = z
  .object({
    listings: z.number().int().nonnegative(),
    enriched: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
    received: z.number().int().nonnegative(),
    created: z.number().int().nonnegative(),
    updated: z.number().int().nonnegative(),
    observed: z.number().int().nonnegative(),
  })
  .strict();
export const crawlerFailureSchema = z
  .object({
    url: z.url().max(2048),
    reason: z.enum(['NETWORK', 'HTTP', 'PARSE', 'EMPTY_PAGE']),
  })
  .strict();
export const crawlerCompletionSchema = z
  .object({
    outcome: z.enum(['SUCCEEDED', 'PARTIAL', 'FAILED', 'ABANDONED']),
    listings: z.number().int().min(0).max(100000),
    enriched: z.number().int().min(0).max(100000),
    failed: z.number().int().min(0).max(100000),
    failures: z.array(crawlerFailureSchema).max(100),
  })
  .strict();
export const crawlerSourceSchema = z.object({
  sourceId: z.string(),
  enabled: z.boolean(),
  schedule: crawlerScheduleSchema,
  timezone: z.string(),
  pageLimit: z.number().int(),
  version: z.number().int(),
  nextDueAt: z.iso.datetime().nullable(),
  latestOutcome: crawlerRunStatusSchema.nullable(),
  workerAvailable: z.boolean(),
});
export const crawlerRunSchema = z.object({
  id: z.uuid(),
  sourceId: z.string(),
  trigger: z.enum(['MANUAL', 'SCHEDULED']),
  status: crawlerRunStatusSchema,
  queuedAt: z.iso.datetime(),
  startedAt: z.iso.datetime().nullable(),
  finishedAt: z.iso.datetime().nullable(),
  counts: crawlerCountsSchema,
  failures: z.array(crawlerFailureSchema),
  configuration: z.object({
    schedule: crawlerScheduleSchema,
    timezone: z.string(),
    pageLimit: z.number(),
  }),
});
export const crawlerClaimSchema = z
  .object({
    runId: z.uuid(),
    sourceId: z.literal('myjobs'),
    leaseToken: z.string(),
    pageLimit: z.number().int().min(1).max(100),
    deadlineAt: z.iso.datetime(),
  })
  .nullable();
export type CrawlerSchedule = z.infer<typeof crawlerScheduleSchema>;
export type CrawlerSource = z.infer<typeof crawlerSourceSchema>;
export type CrawlerRun = z.infer<typeof crawlerRunSchema>;
export type CrawlerCounts = z.infer<typeof crawlerCountsSchema>;
export type CrawlerFailure = z.infer<typeof crawlerFailureSchema>;
export type UpdateCrawlerSource = z.infer<typeof updateCrawlerSourceSchema>;
export type CrawlerCompletion = z.infer<typeof crawlerCompletionSchema>;
export type CrawlerClaim = NonNullable<z.infer<typeof crawlerClaimSchema>>;
export type CrawlerPagination = z.infer<typeof crawlerPaginationSchema>;
export class UpdateCrawlerSourceDto {
  static schema = updateCrawlerSourceSchema;
  declare expectedVersion: number;
  declare enabled?: boolean;
  declare schedule?: CrawlerSchedule;
  declare timezone?: string;
  declare pageLimit?: number;
}
export class CrawlerPaginationDto {
  static schema = crawlerPaginationSchema;
  declare page: number;
  declare limit: number;
}
export class CrawlerSourceParamsDto {
  static schema = crawlerSourceParamsSchema;
  declare sourceId: 'myjobs';
}
export class CrawlerRunParamsDto {
  static schema = crawlerRunParamsSchema;
  declare sourceId: 'myjobs';
  declare runId: string;
}
export class CrawlerRunNowDto {
  static schema = z.object({}).strict().default({});
}
