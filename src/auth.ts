import { z } from 'zod';

// #region Login
export const loginRequestSchema = z.object({
	username: z
		.string({ error: 'Username is required' })
		.trim()
		.min(1, 'Username is required'),
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
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export interface LoginResponseDto extends LoginResponse {}

export class LoginResponseDto {
	static readonly schema = loginResponseSchema;
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
		email: z
			.string({ error: 'Email is required' })
			.trim()
			.toLowerCase()
			.email('Invalid email format')
			.max(255, 'Email is too long'),
		password: z
			.string({ error: 'Password is required' })
			.min(8, 'Password must be at least 8 characters long')
			.max(128, 'Password must not exceed 128 characters')
			.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
			.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
			.regex(/[0-9]/, 'Password must contain at least one number')
			.regex(
				/[^A-Za-z0-9]/,
				'Password must contain at least one special character',
			),
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
