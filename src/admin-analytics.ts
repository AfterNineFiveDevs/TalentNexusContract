import { z } from 'zod';
export const adminAnalyticsQuerySchema = z
  .object({
    period: z.coerce
      .number()
      .pipe(z.union([z.literal(7), z.literal(30), z.literal(90)]))
      .default(30),
  })
  .strict();
const count = z.number().int().nonnegative();
const unavailable = z.object({
  value: z.null(),
  available: z.literal(false),
  reason: z.literal('Activity tracking is not implemented'),
});
export const adminAnalyticsOverviewSchema = z.object({
  period: z.union([z.literal(7), z.literal(30), z.literal(90)]),
  timezone: z.literal('Asia/Yangon'),
  from: z.iso.datetime(),
  to: z.iso.datetime(),
  generatedAt: z.iso.datetime(),
  totalCandidates: count,
  newCandidates: count,
  jobsFirstPublished: count,
  daily: z.array(
    z.object({
      date: z.iso.date(),
      newCandidates: count,
      jobsFirstPublished: count,
    }),
  ),
  activeUsers: unavailable,
  jobViews: unavailable,
  applyClicks: unavailable,
  journeyRates: unavailable,
});
export type AdminAnalyticsQuery = z.infer<typeof adminAnalyticsQuerySchema>;
export type AdminAnalyticsOverview = z.infer<
  typeof adminAnalyticsOverviewSchema
>;
export class AdminAnalyticsQueryDto {
  static readonly schema = adminAnalyticsQuerySchema;
}
export interface AdminAnalyticsQueryDto extends AdminAnalyticsQuery {}
