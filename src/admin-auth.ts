import { z } from 'zod';
import { emailSchema, loginRequestSchema, passwordSchema, loginResponseSchema } from './auth.js';

export const adminPasswordSchema = passwordSchema.min(12, 'Admin passwords must contain at least 12 characters');
const token = z.string().min(32).max(512);
const code = z.string().regex(/^\d{6}$/, 'Enter a six-digit authenticator code');
export const adminLoginSchema = loginRequestSchema.strict();
export const adminChallengeSchema = z.object({ challengeToken: token }).strict();
export const adminMfaVerifySchema = adminChallengeSchema.extend({ code }).strict();
export const adminRecoveryVerifySchema = adminChallengeSchema.extend({ recoveryCode: z.string().min(1).max(128) }).strict();
export const adminInviteSchema = z.object({ name: z.string().trim().min(1).max(100), email: emailSchema }).strict();
export const adminInvitationTokenSchema = z.object({ token }).strict();
export const adminAcceptInvitationSchema = z.object({
  token,
  password: z.string().min(1).max(128),
  confirmPassword: z.string().max(128).optional(),
}).strict();
export const adminReauthenticateSchema = z.object({
  password: z.string().min(1).max(128),
  code: code.optional(),
  recoveryCode: z.string().min(1).max(128).optional(),
}).strict().refine(v => Boolean(v.code) !== Boolean(v.recoveryCode), { message: 'Supply one authenticator or recovery code' });
export const adminIdParamsSchema = z.object({ id: z.uuid() }).strict();
export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();
export const adminNextStepSchema = z.object({
  nextStep: z.enum(['MFA_ENROLLMENT', 'MFA_VERIFICATION']),
  challengeToken: token,
  expiresAt: z.iso.datetime(),
});
export const adminEnrollmentSchema = z.object({ secret: z.string(), otpauthUri: z.string() });
export const adminSessionResponseSchema = loginResponseSchema.extend({ expiresIn: z.literal(900), sessionExpiresAt: z.iso.datetime() });
export const adminEnrollmentCompleteSchema = adminSessionResponseSchema.extend({ recoveryCodes: z.array(z.string()).length(10) });
export const adminProfileSchema = z.object({ id: z.uuid(), email: z.email(), name: z.string().nullable(), role: z.literal('ADMIN'), mfaEnabled: z.literal(true) });
export const adminInvitationInspectionSchema = z.object({ email: z.email(), name: z.string(), existingAccount: z.boolean(), expiresAt: z.iso.datetime() });
export const adminInvitationSchema = z.object({ id: z.uuid(), email: z.email(), name: z.string(), state: z.enum(['PENDING', 'ONBOARDING', 'ACCEPTED', 'REVOKED']), expiresAt: z.iso.datetime(), createdAt: z.iso.datetime() });
export const adminMemberSchema = z.object({ userId: z.uuid(), email: z.email(), name: z.string().nullable(), state: z.enum(['ONBOARDING', 'ACTIVE', 'DISABLED']), mfaEnabled: z.boolean(), createdAt: z.iso.datetime() });
export type AdminNextStep = z.infer<typeof adminNextStepSchema>;
export type AdminSessionResponse = z.infer<typeof adminSessionResponseSchema>;
export type AdminInvite = z.infer<typeof adminInviteSchema>;
export type AdminAcceptInvitation = z.infer<typeof adminAcceptInvitationSchema>;
export type AdminReauthenticate = z.infer<typeof adminReauthenticateSchema>;
export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
export class AdminLoginDto { static readonly schema = adminLoginSchema; declare email: string; declare password: string; }
export class AdminChallengeDto { static readonly schema = adminChallengeSchema; declare challengeToken: string; }
export class AdminMfaVerifyDto { static readonly schema = adminMfaVerifySchema; declare challengeToken: string; declare code: string; }
export class AdminRecoveryVerifyDto { static readonly schema = adminRecoveryVerifySchema; declare challengeToken: string; declare recoveryCode: string; }
export class AdminInviteDto { static readonly schema = adminInviteSchema; declare name: string; declare email: string; }
export class AdminInvitationTokenDto { static readonly schema = adminInvitationTokenSchema; declare token: string; }
export class AdminAcceptInvitationDto { static readonly schema = adminAcceptInvitationSchema; declare token: string; declare password: string; declare confirmPassword?: string; }
export class AdminReauthenticateDto { static readonly schema = adminReauthenticateSchema; declare password: string; declare code?: string; declare recoveryCode?: string; }
export class AdminIdParamsDto { static readonly schema = adminIdParamsSchema; declare id: string; }
export class AdminListQueryDto { static readonly schema = adminListQuerySchema; declare page: number; declare limit: number; }

export type AdminLoginRequest = z.infer<typeof adminLoginSchema>;
export type AdminChallengeRequest = z.infer<typeof adminChallengeSchema>;
export type AdminMfaVerifyRequest = z.infer<typeof adminMfaVerifySchema>;
export type AdminRecoveryVerifyRequest = z.infer<typeof adminRecoveryVerifySchema>;
export type AdminInvitationTokenRequest = z.infer<typeof adminInvitationTokenSchema>;
export type AdminEnrollment = z.infer<typeof adminEnrollmentSchema>;
export type AdminEnrollmentComplete = z.infer<typeof adminEnrollmentCompleteSchema>;
export type AdminProfile = z.infer<typeof adminProfileSchema>;
export type AdminInvitationInspection = z.infer<typeof adminInvitationInspectionSchema>;
export type AdminInvitation = z.infer<typeof adminInvitationSchema>;
export type AdminMember = z.infer<typeof adminMemberSchema>;
export type AdminIdParams = z.infer<typeof adminIdParamsSchema>;
