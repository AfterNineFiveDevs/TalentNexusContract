import test from 'node:test';
import assert from 'node:assert/strict';
import {
  crawlerScheduleSchema,
  updateCrawlerSourceSchema,
  crawlerScrapedJobSchema,
  crawlerCompletionSchema,
  crawlerClaimSchema,
} from '../dist/index.js';
import { IngestJobsRequest, IngestJobsResponse } from '../dist/grpc/index.js';
test('weekly and interval schedules validate admin configuration', () => {
  assert.equal(
    crawlerScheduleSchema.safeParse({
      kind: 'weekly',
      weekdays: [1, 4],
      time: '09:00',
    }).success,
    true,
  );
  assert.equal(
    crawlerScheduleSchema.safeParse({ kind: 'interval', hours: 6 }).success,
    true,
  );
  for (const schedule of [
    { kind: 'weekly', weekdays: [], time: '09:00' },
    { kind: 'weekly', weekdays: [1, 1], time: '09:00' },
    { kind: 'interval', hours: 0 },
  ])
    assert.equal(crawlerScheduleSchema.safeParse(schedule).success, false);
});
test('configuration mutations reject unknown fields and stale-shape input', () => {
  for (const input of [
    { expectedVersion: 0 },
    { expectedVersion: -1, enabled: true },
    { expectedVersion: 0, sourceId: 'manual' },
    { expectedVersion: 0, timezone: 'bad/zone' },
    { expectedVersion: 0, pageLimit: 101 },
  ])
    assert.equal(updateCrawlerSourceSchema.safeParse(input).success, false);
  assert.equal(
    updateCrawlerSourceSchema.safeParse({
      expectedVersion: 0,
      timezone: 'Asia/Yangon',
    }).success,
    true,
  );
});
test('scraped job URL and content validation defaults empty applications', () => {
  const job = {
    externalId: 'id',
    sourceUrl: 'https://example.com',
    title: 'Title',
    companyName: 'Company',
    location: 'Yangon',
    description: 'Description',
  };
  assert.deepEqual(crawlerScrapedJobSchema.parse(job).applicationUrl, []);
  assert.equal(
    crawlerScrapedJobSchema.safeParse({
      ...job,
      sourceUrl: 'javascript:alert(1)',
    }).success,
    false,
  );
});
test('completion failure details are bounded and worker idle claims are explicit', () => {
  assert.equal(
    crawlerCompletionSchema.safeParse({
      outcome: 'PARTIAL',
      listings: 2,
      enriched: 1,
      failed: 1,
      failures: [{ url: 'https://example.com', reason: 'PARSE' }],
    }).success,
    true,
  );
  assert.equal(crawlerClaimSchema.parse(null), null);
});
test('new protobuf fields round-trip and old payloads retain defaults', () => {
  const old = IngestJobsRequest.decode(
    IngestJobsRequest.encode({ sourceId: 'myjobs', jobs: [] }).finish(),
  );
  assert.equal(old.sourceId, 'myjobs');
  assert.equal(old.runId, undefined);
  const response = { received: 3, created: 1, updated: 1, observed: 1 };
  assert.deepEqual(
    IngestJobsResponse.decode(IngestJobsResponse.encode(response).finish()),
    response,
  );
});
