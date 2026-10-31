import { z } from 'zod';

export const jobStatusSchema = z.enum([
	'PENDING',
	'PUBLISHED',
	'REJECTED',
	'CLOSED',
]);

export const adminJobsQuerySchema = z.object({
	location: z.string().trim().min(1).max(200).optional(),
	title: z.string().trim().min(1).max(200).optional(),
	companyName: z.string().trim().min(1).max(200).optional(),
	sourceId: z.string().trim().min(1).max(100).optional(),
	status: jobStatusSchema.optional(),

	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),

	sortBy: z
		.enum([
			'createdAt',
			'updatedAt',
			'lastSeenAt',
			'publishedAt',
			'title',
			'companyName',
		])
		.default('createdAt'),

	sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type AdminJobsQuery = z.infer<typeof adminJobsQuerySchema>;

export interface AdminJobsQueryDto extends AdminJobsQuery {}

export class AdminJobsQueryDto {
	static readonly schema = adminJobsQuerySchema;
}
