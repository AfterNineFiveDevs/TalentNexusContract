import { z } from 'zod';

/** Fields a candidate can edit on their own profile. */
export const profileEditableFields = ['name', 'phone', 'bio', 'photoUrl'] as const;
export type ProfileField = (typeof profileEditableFields)[number];

const PHONE_PATTERN = /^\+?[0-9 ()-]{6,20}$/;

/**
 * PATCH /me/profile body. Only the fields you send change.
 * Send null (or an empty string for phone/bio) to clear a field.
 * `.strict()` rejects unknown keys such as `role` or `email`.
 */
export const updateProfileSchema = z
	.object({
		name: z.string().trim().min(1, 'Name is required').max(100),
		phone: z
			.string()
			.trim()
			.max(20)
			.refine((value) => value === '' || PHONE_PATTERN.test(value), {
				message: 'Phone must be 6-20 digits and may start with +',
			})
			.nullable(),
		bio: z.string().trim().max(1000).nullable(),
		photoUrl: z
			.url({ protocol: /^https$/, error: 'Photo URL must be an https URL' })
			.max(2048)
			.nullable(),
	})
	.partial()
	.strict()
	.refine((value) => profileEditableFields.some((key) => value[key] !== undefined), {
		message: 'Provide a profile field to update',
	});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

export interface UpdateProfileDto extends UpdateProfileRequest {}

export class UpdateProfileDto {
	static readonly schema = updateProfileSchema;
}

/** GET/PATCH /me/profile response data. */
export const profileSchema = z.object({
	userId: z.uuid(),
	email: z.email(),
	name: z.string().nullable(),
	phone: z.string().nullable(),
	bio: z.string().nullable(),
	photoUrl: z.string().nullable(),
	completeness: z.object({
		percent: z.number().int().min(0).max(100),
		missing: z.array(z.enum(profileEditableFields)),
	}),
	updatedAt: z.iso.datetime(),
});

export type Profile = z.infer<typeof profileSchema>;
