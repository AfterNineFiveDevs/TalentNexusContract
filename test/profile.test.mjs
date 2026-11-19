import assert from "node:assert/strict";
import { test } from "node:test";
import { updateProfileSchema } from "../dist/profile.js";

test("accepts and trims valid fields", () => {
  assert.deepEqual(
    updateProfileSchema.parse({
      name: " Aye Aye ",
      phone: " +95 9 123 456 789 ",
      bio: " Accountant ",
      photoUrl: "https://cdn.example.com/me.png",
    }),
    {
      name: "Aye Aye",
      phone: "+95 9 123 456 789",
      bio: "Accountant",
      photoUrl: "https://cdn.example.com/me.png",
    },
  );
});

test("allows clearing fields with null or empty text", () => {
  assert.deepEqual(updateProfileSchema.parse({ bio: null, phone: "" }), {
    bio: null,
    phone: "",
  });
});

test("rejects an empty body", () => {
  assert.equal(updateProfileSchema.safeParse({}).success, false);
});

test("rejects unknown keys such as role and email", () => {
  assert.equal(updateProfileSchema.safeParse({ role: "ADMIN" }).success, false);
  assert.equal(
    updateProfileSchema.safeParse({ name: "A", email: "x@example.com" }).success,
    false,
  );
});

test("rejects a bad phone, blank name, long bio, and non-https photo", () => {
  for (const body of [
    { phone: "call me" },
    { name: "   " },
    { name: null },
    { bio: "x".repeat(1001) },
    { photoUrl: "http://cdn.example.com/me.png" },
    { photoUrl: "javascript:alert(1)" },
  ]) {
    assert.equal(updateProfileSchema.safeParse(body).success, false, JSON.stringify(body));
  }
});
