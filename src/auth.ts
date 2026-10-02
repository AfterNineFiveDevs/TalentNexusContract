import { z } from 'zod';
import { Role } from './enum.js';

export const authenticatedUserSchema = z.object({
	id: z.uuid(),
	email: z.email(),
	role: z.enum(Role),
});

export const emailSchema = z
	.string({ error: 'Email is required' })
	.trim()
	.toLowerCase()
	.email('Invalid email format')
	.max(255, 'Email is too long');

export const passwordSchema = z
	.string({ error: 'Password is required' })
	.min(8, 'Password must be at least 8 characters long')
	.max(128, 'Password must not exceed 128 characters')
	.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
	.regex(/[0-9]/, 'Password must contain at least one number')
	.regex(
		/[^A-Za-z0-9]/,
		'Password must contain at least one special character',
	);

const actionTokenSchema = z
	.string({ error: 'Token is required' })
	.trim()
	.min(1, 'Token is required');

/** A safe, authenticated identity attached to a request by an auth guard. */
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

// #region Login
export const loginRequestSchema = z.object({
	email: emailSchema,
	password: z
		.string({ error: 'Password is required' })
		.min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export interface LoginRequestDto extends LoginRequest {}

export class LoginRequestDto {
	static readonly schema = loginRequestSchema;
}

export const loginResponseSchema = z.object({
	access_token: z.string(),
	id: z.uuid(),
	email: z.email(),
	role: z.enum(Role),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export interface LoginResponseDto extends LoginResponse {}

export class LoginResponseDto {
	static readonly schema = loginResponseSchema;
}

export const refreshResponseSchema = loginResponseSchema;

export type RefreshResponse = z.infer<typeof refreshResponseSchema>;

export interface RefreshResponseDto extends RefreshResponse {}

export class RefreshResponseDto {
	static readonly schema = refreshResponseSchema;
}
// #endregion

// #region SignUp
export const signupRequestSchema = z
	.object({
		username: z
			.string({ error: 'Username is required' })
			.trim()
			.min(3, 'Username must be at least 3 characters')
			.max(50, 'Username cannot exceed 50 characters')
			.regex(/^[a-zA-Z\s]+$/, 'Username can only contain letters and spaces')
			.refine(
				(val) => val.trim().length >= 3,
				'Username must contain at least 3 non-space characters',
			),
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z
			.string({ error: 'Confirm password is required' })
			.min(1, 'Please confirm your password'),
		termsAccepted: z.literal(true, {
			error: 'You must accept the terms and conditions',
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export type SignUpRequest = z.infer<typeof signupRequestSchema>;

export interface SignUpRequestDto extends SignUpRequest {}

export class SignUpRequestDto {
	static readonly schema = signupRequestSchema;
}
// #endregion

// #region Email verification and password recovery
export const verifyEmailRequestSchema = z.object({ token: actionTokenSchema });
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;
export interface VerifyEmailRequestDto extends VerifyEmailRequest {}
export class VerifyEmailRequestDto {
	static readonly schema = verifyEmailRequestSchema;
}

export const resendVerificationRequestSchema = z.object({ email: emailSchema });
export type ResendVerificationRequest = z.infer<
	typeof resendVerificationRequestSchema
>;
export interface ResendVerificationRequestDto
	extends ResendVerificationRequest {}
export class ResendVerificationRequestDto {
	static readonly schema = resendVerificationRequestSchema;
}

export const forgotPasswordRequestSchema = z.object({ email: emailSchema });
export type ForgotPasswordRequest = z.infer<
	typeof forgotPasswordRequestSchema
>;
export interface ForgotPasswordRequestDto extends ForgotPasswordRequest {}
export class ForgotPasswordRequestDto {
	static readonly schema = forgotPasswordRequestSchema;
}

export const resetPasswordRequestSchema = z
	.object({
		token: actionTokenSchema,
		password: passwordSchema,
		confirmPassword: z
			.string({ error: 'Confirm password is required' })
			.min(1, 'Please confirm your password'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export interface ResetPasswordRequestDto extends ResetPasswordRequest {}
export class ResetPasswordRequestDto {
	static readonly schema = resetPasswordRequestSchema;
}
// #endregion
