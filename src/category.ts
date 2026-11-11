import { z } from 'zod';

export const categoryStatusSchema = z.enum(['ACTIVE', 'HIDDEN', 'ARCHIVED']);
const name = z.string().trim().min(1).max(100);
const description = z.string().trim().max(2000);
const expectedVersion = z.number().int().min(0).max(2_147_483_646);
export const categoryPaginationSchema = z
  .object({
    page: z.coerce.number().int().min(1).max(2_147_483_647).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
export const adminCategoriesQuerySchema = categoryPaginationSchema
  .extend({
    search: z.string().trim().min(1).max(100).optional(),
    status: z.enum(['ACTIVE', 'HIDDEN', 'ARCHIVED', 'all']).optional(),
  })
  .strict();
export const createCategorySchema = z
  .object({
    name,
    description: description.default(''),
    status: z.enum(['ACTIVE', 'HIDDEN']).default('ACTIVE'),
  })
  .strict();
export const updateCategorySchema = z
  .object({
    expectedVersion,
    name: name.optional(),
    description: description.optional(),
    status: z.enum(['ACTIVE', 'HIDDEN']).optional(),
  })
  .strict()
  .refine(
    (v) =>
      v.name !== undefined ||
      v.description !== undefined ||
      v.status !== undefined,
    { message: 'Provide a category field to update' },
  );
export const categoryVersionSchema = z.object({ expectedVersion }).strict();
export const categoryIdParamsSchema = z.object({ id: z.uuid() }).strict();
export const categorySubscriptionParamsSchema = z
  .object({ categoryId: z.uuid() })
  .strict();
export const publicCategorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
});
export const adminCategorySchema = publicCategorySchema.extend({
  status: categoryStatusSchema,
  version: z.number().int().min(0),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  subscriberCount: z.number().int().min(0),
  assignedJobCount: z.number().int().min(0),
});
export const categorySubscriberSchema = z.object({
  userId: z.uuid(),
  name: z.string().nullable(),
  email: z.email(),
  subscribedAt: z.iso.datetime(),
});
export const categorySubscriptionSchema = z.object({
  category: publicCategorySchema.extend({ status: categoryStatusSchema }),
  subscribedAt: z.iso.datetime(),
});
export type AdminCategoriesQuery = z.infer<typeof adminCategoriesQuerySchema>;
export type CategoryPagination = z.infer<typeof categoryPaginationSchema>;
export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;
export type CategoryVersionRequest = z.infer<typeof categoryVersionSchema>;
export type PublicCategory = z.infer<typeof publicCategorySchema>;
export type AdminCategory = z.infer<typeof adminCategorySchema>;
export type CategorySubscriber = z.infer<typeof categorySubscriberSchema>;
export type CategorySubscription = z.infer<typeof categorySubscriptionSchema>;
export class AdminCategoriesQueryDto {
  static readonly schema = adminCategoriesQuerySchema;
}
export interface AdminCategoriesQueryDto extends AdminCategoriesQuery {}
export class CategoryPaginationDto {
  static readonly schema = categoryPaginationSchema;
}
export interface CategoryPaginationDto extends CategoryPagination {}
export class CreateCategoryDto {
  static readonly schema = createCategorySchema;
}
export interface CreateCategoryDto extends CreateCategoryRequest {}
export class UpdateCategoryDto {
  static readonly schema = updateCategorySchema;
}
export interface UpdateCategoryDto extends UpdateCategoryRequest {}
export class CategoryVersionDto {
  static readonly schema = categoryVersionSchema;
}
export interface CategoryVersionDto extends CategoryVersionRequest {}
export class CategoryIdParamsDto {
  static readonly schema = categoryIdParamsSchema;
}
export interface CategoryIdParamsDto extends z.infer<
  typeof categoryIdParamsSchema
> {}
export class CategorySubscriptionParamsDto {
  static readonly schema = categorySubscriptionParamsSchema;
}
export interface CategorySubscriptionParamsDto extends z.infer<
  typeof categorySubscriptionParamsSchema
> {}
