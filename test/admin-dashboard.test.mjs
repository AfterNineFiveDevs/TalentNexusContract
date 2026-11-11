import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryVersionSchema,
  adminCategoriesQuerySchema,
  categoryPaginationSchema,
  adminJobsFilterSchema,
  adminJobsQuerySchema,
  createAdminJobSchema,
  updateAdminJobSchema,
  adminAnalyticsQuerySchema,
} from '../dist/index.js';
const job = {
  title: 'Job',
  companyName: 'Company',
  description: 'Details',
  location: 'Yangon',
  sourceUrl: 'https://example.com/job',
};
const categoryId = '8d240e43-350a-4e90-85d6-2742a97ce42d';
test('category creation trims and supplies defaults while protecting internal fields', () => {
  assert.deepEqual(createCategorySchema.parse({ name: ' Accounting ' }), {
    name: 'Accounting',
    description: '',
    status: 'ACTIVE',
  });
  for (const values of [
    { name: ' ' },
    { name: 'New', status: 'ARCHIVED' },
    { name: 'New', version: 12 },
    { name: 'New', normalizedName: 'override' },
  ])
    assert.equal(createCategorySchema.safeParse(values).success, false);
});
test('category mutations require a bounded version and a nonempty patch', () => {
  for (const values of [
    { name: 'New' },
    { expectedVersion: 0 },
    { expectedVersion: -1, name: 'New' },
    { expectedVersion: 0, status: 'ARCHIVED' },
  ])
    assert.equal(updateCategorySchema.safeParse(values).success, false);
  assert.equal(
    updateCategorySchema.safeParse({ expectedVersion: 0, name: 'New' }).success,
    true,
  );
  assert.equal(
    categoryVersionSchema.safeParse({ expectedVersion: 2_147_483_647 }).success,
    false,
  );
});
test('category filtering supports archived/all only in admin queries and bounds paging', () => {
  assert.deepEqual(
    adminCategoriesQuerySchema.parse({ status: 'all', page: '2' }),
    { page: 2, limit: 20, status: 'all' },
  );
  assert.equal(
    categoryPaginationSchema.safeParse({ status: 'ARCHIVED' }).success,
    false,
  );
  assert.equal(
    adminCategoriesQuerySchema.safeParse({ limit: 101 }).success,
    false,
  );
  assert.equal(
    adminCategoriesQuerySchema.safeParse({ page: 0 }).success,
    false,
  );
});
test('job assignment distinguishes omission, null and UUID, without changing source transport', () => {
  assert.equal(createAdminJobSchema.parse(job).categoryId, undefined);
  assert.equal(
    createAdminJobSchema.parse({ ...job, categoryId }).categoryId,
    categoryId,
  );
  assert.equal(
    updateAdminJobSchema.parse({
      expectedVersion: 0,
      content: { categoryId: null },
    }).content.categoryId,
    null,
  );
  assert.equal(
    updateAdminJobSchema.safeParse({
      expectedVersion: 0,
      content: { categoryId: 'wrong' },
    }).success,
    false,
  );
});
test('queue filters accept the same category filter without pagination/sorting', () => {
  assert.deepEqual(
    adminJobsFilterSchema.parse({ categoryId, status: 'PENDING' }),
    { deletion: 'active', categoryId, status: 'PENDING' },
  );
  assert.equal(adminJobsFilterSchema.safeParse({ limit: 20 }).success, false);
});
test('analytics accepts only implemented periods and rejects unsupported segments', () => {
  assert.deepEqual(adminAnalyticsQuerySchema.parse({}), { period: 30 });
  for (const period of ['7', '30', '90'])
    assert.equal(
      adminAnalyticsQuerySchema.parse({ period }).period,
      Number(period),
    );
  assert.equal(
    adminAnalyticsQuerySchema.safeParse({ period: 8 }).success,
    false,
  );
  assert.equal(
    adminAnalyticsQuerySchema.safeParse({ segment: 'premium' }).success,
    false,
  );
});

test('existing job list queries retain unknown-field stripping compatibility', () => {
  const parsed = adminJobsQuerySchema.parse({
    title: 'Accountant',
    unrelated: 'ignored',
  });
  assert.equal(parsed.title, 'Accountant');
  assert.equal('unrelated' in parsed, false);
});
