import { z, TypeOf } from 'zod';

export const createHeroSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must contain only alphabets',
      })
      .min(2, { message: 'Name must have at least 2 characters' })
      .max(32, { message: 'Name cannot exceed 32 characters' })
      .refine((value: string) => /^[A-Za-z\s]+$/.test(value), {
        message: 'Name must contain only alphabets',
      })
      .refine((value: string) => value.replace(/\s+/g, ' ').trim(), {
        message: 'Please enter a valid name with one space between each word',
      }),
    alterEgo: z
      .string({
        required_error: 'Alter Ego is required',
        invalid_type_error: 'Alter Ego must contain only alphabets',
      })
      .min(2, { message: 'Alter Ego must have at least 2 characters' })
      .max(32, { message: 'Alter Ego cannot exceed 32 characters' })
      .refine((value: string) => /^[A-Za-z\s]+$/.test(value), {
        message: 'Alter Ego must contain only alphabets',
      })
      .refine((value: string) => value.replace(/\s+/g, ' ').trim(), {
        message: 'Please enter a valid name with one space between each word',
      }),
    image: z.optional(z.string()),
  }),
});

export type CreateHeroInput = TypeOf<typeof createHeroSchema>['body'];
