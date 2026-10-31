import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adminLoginSchema, adminInviteSchema, adminAcceptInvitationSchema, adminReauthenticateSchema, adminMfaVerifySchema, adminPasswordSchema, adminListQuerySchema } from '../dist/index.js';
test('admin requests reject role injection, normalize email, and bound pagination', () => {
  assert.equal(adminLoginSchema.safeParse({ email: 'staff@example.com', password: 'password', role: 'ADMIN' }).success, false);
  assert.equal(adminInviteSchema.parse({ name: 'Staff', email: ' STAFF@EXAMPLE.COM ' }).email, 'staff@example.com');
  assert.deepEqual(adminListQuerySchema.parse({}), { page: 1, limit: 20 });
  assert.equal(adminListQuerySchema.safeParse({ limit: 101 }).success, false);
});
test('admin MFA and reauthentication require exactly one valid proof', () => {
  assert.equal(adminMfaVerifySchema.safeParse({ challengeToken: 'a'.repeat(43), code: '12345' }).success, false);
  assert.equal(adminReauthenticateSchema.safeParse({ password: 'password' }).success, false);
  assert.equal(adminReauthenticateSchema.safeParse({ password: 'password', code: '123456', recoveryCode: 'code' }).success, false);
  assert.equal(adminReauthenticateSchema.safeParse({ password: 'password', code: '123456' }).success, true);
});
test('new staff password policy is stronger while existing-account acceptance retains its password', () => {
  assert.equal(adminPasswordSchema.safeParse('ShortPass1!').success, false);
  assert.equal(adminPasswordSchema.safeParse('StrongPassword123!').success, true);
  assert.equal(adminAcceptInvitationSchema.safeParse({ token: 'a'.repeat(43), password: 'existing-password' }).success, true);
});
