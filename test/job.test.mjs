import assert from "node:assert/strict";
import { test } from "node:test";
import {
  adminJobsQuerySchema,
  createAdminJobSchema,
  updateAdminJobSchema,
  publishAdminJobSchema,
  adminJobActionRequestSchema,
  adminJobReasonRequestSchema,
  jobIdParamsSchema,
} from "../dist/job.js";

const content = {
  title: " Accountant ",
  companyName: " Company ",
  description: " Description ",
  location: " Yangon ",
  sourceUrl: "https://example.com/jobs/1",
};

test("query coercion and defaults", () => {
  assert.deepEqual(
    adminJobsQuerySchema.parse({
      limit: "10",
      page: "2",
      title: " Accountant ",
    }),
    {
      title: "Accountant",
      deletion: "active",
      limit: 10,
      page: 2,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  );
});

test("query rejects invalid limits, orders, statuses, and deletion selectors", () => {
  for (const input of [
    { limit: 0 },
    { limit: 101 },
    { page: -1 },
    { page: 2.5 },
    { sortBy: "password" },
    { sortOrder: "sideways" },
    { status: "APPROVED" },
    { deletion: "hidden" },
    { title: "" },
    { page: 9e15 },
  ]) {
    assert.equal(adminJobsQuerySchema.safeParse(input).success, false);
  }
});

test("manual creation trims text and supplies empty application destinations", () => {
  assert.deepEqual(createAdminJobSchema.parse(content), {
    ...content,
    title: "Accountant",
    companyName: "Company",
    description: "Description",
    location: "Yangon",
    applicationUrl: [],
  });
});

test("all URLs must use HTTP(S)", () => {
  for (const value of [
    "javascript:alert(1)",
    "ftp://example.com/file",
    "mailto:hr@example.com",
    "/relative",
  ]) {
    assert.equal(
      createAdminJobSchema.safeParse({ ...content, sourceUrl: value }).success,
      false,
    );
    assert.equal(
      createAdminJobSchema.safeParse({ ...content, applicationUrl: [value] })
        .success,
      false,
    );
  }
});

test("unknown and protected creation fields are rejected", () => {
  for (const field of [
    "status",
    "id",
    "sourceId",
    "externalId",
    "version",
    "reviewedById",
    "deletedAt",
    "lastSeenAt",
  ]) {
    assert.equal(
      createAdminJobSchema.safeParse({ ...content, [field]: "forged" }).success,
      false,
    );
  }
});

test("edit requires a version and a nonempty strict content patch", () => {
  for (const input of [
    { content: { title: "New" } },
    { expectedVersion: 0, content: {} },
    { expectedVersion: 0, content: { status: "PUBLISHED" } },
    { expectedVersion: 0, content: { title: "New" }, version: 5 },
    { expectedVersion: -1, content: { title: "New" } },
  ]) {
    assert.equal(updateAdminJobSchema.safeParse(input).success, false);
  }
  assert.equal(
    updateAdminJobSchema.safeParse({
      expectedVersion: 0,
      content: { applicationUrl: [] },
    }).success,
    true,
  );
});

test("publish optionally accepts validated final edits", () => {
  assert.equal(
    publishAdminJobSchema.safeParse({ expectedVersion: 0 }).success,
    true,
  );
  assert.equal(
    publishAdminJobSchema.safeParse({
      expectedVersion: 0,
      content: { title: "Final" },
    }).success,
    true,
  );
  assert.equal(
    publishAdminJobSchema.safeParse({ expectedVersion: 0, content: {} })
      .success,
    false,
  );
});

test("reject and delete need a nonblank reason", () => {
  for (const note of [undefined, "", "   "]) {
    assert.equal(
      adminJobReasonRequestSchema.safeParse({ expectedVersion: 0, note })
        .success,
      false,
    );
  }
  assert.equal(
    adminJobReasonRequestSchema.parse({
      expectedVersion: 0,
      note: " Duplicate ",
    }).note,
    "Duplicate",
  );
  assert.equal(
    adminJobActionRequestSchema.safeParse({ expectedVersion: 0 }).success,
    true,
  );
});

test("IDs are UUIDs and mutation actors cannot be supplied", () => {
  assert.equal(
    jobIdParamsSchema.safeParse({ id: "not-a-uuid" }).success,
    false,
  );
  assert.equal(
    adminJobActionRequestSchema.safeParse({
      expectedVersion: 0,
      actorId: "forged",
    }).success,
    false,
  );
});
