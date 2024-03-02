import { z, TypeOf } from 'zod';
import {
  isAdult,
  DATE_FORMAT,
  isValidPhoneNumber,
  isValidDateFormat,
} from '../../utils/common-utils';
import moment from 'moment';

export const registerUserSchema = z
  .object({
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
        message:
          'Please enter a valid full name with one space between each word',
      }),
    date_of_birth: z
      .string({
        required_error: 'Date of birth is required',
        invalid_type_error: 'Date must be in DD/MM/YYYY format',
      })
      .refine(isValidDateFormat, {
        message: 'Date must be in DD/MM/YYYY format',
      })
      .refine(isAdult, {
        message: 'You must be at least 18 years old to sign up',
      })
      .refine(
        (val) => new Date(moment(val, DATE_FORMAT).toDate()) <= new Date(),
        {
          message: 'Date of birth cannot be in the future',
        },
      ),
    organization: z
      .string({
        required_error: 'Organization is required',
        invalid_type_error: 'Organization must contain alphanumeric characters',
      })
      .min(2, { message: 'Organization must have at least 2 characters' })
      .max(32, { message: 'Organization cannot exceed 32 characters' })
      .refine((value: string) => /^[a-zA-Z0-9.,&()\-+/ ]+$/.test(value), {
        message:
          'Organization must contain only alphabets, numbers, period, comma, parenteses, ampersand, dash, plus, slash',
      })
      .refine((value: string) => value.replace(/\s+/g, ' ').trim(), {
        message:
          'Please enter a valid organization with one space between each word',
      }),
    email: z
      .string({
        required_error: 'Email address is required',
        invalid_type_error: 'Invalid email address',
      })
      .email('Invalid email address'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, { message: 'Password must contain at least 8 characters' })
      .max(32, { message: 'Password cannot exceed 32 characters' })
      .refine(
        (val) =>
          /^(?=.*[A-Z])(?=.*\d)(?=(.*\W){1})(?=.*[a-zA-Z])(?!.*\s).{8,32}$/.test(
            val,
          ),
        {
          message:
            'Password must contain at least one capital letter, a special character and a numeric digit',
        },
      ),
    password_confirm: z
      .string({
        required_error: 'Confirm Password is required',
      })
      .min(8, { message: 'Password must contain at least 8 characters' })
      .max(32, { message: 'Password cannot exceed 32 characters' })
      .refine(
        (val) =>
          /^(?=.*[A-Z])(?=.*\d)(?=(.*\W){1})(?=.*[a-zA-Z])(?!.*\s).{8,32}$/.test(
            val,
          ),
        {
          message:
            'Password must contain at least one capital letter, a special character and a numeric digit',
        },
      ),
    phone_number: z
      .string({
        required_error: 'Phone Number is required',
      })
      .refine(isValidPhoneNumber, { message: 'Invalid Phone Number' }),
    sex: z.optional(z.string()),
    role: z.optional(
      z
        .literal('user')
        .or(z.literal('manager'))
        .or(z.literal('admin'))
        .or(z.string()),
    ),
    photo: z.optional(z.string()),
  })
  .refine((data) => data.password === data.password_confirm, {
    path: ['password_confirm'],
    message: 'Passwords do not match',
  });

export const emailPasswordSchema = z.object({
  email: z
    .string({
      required_error: 'Email address is required',
    })
    .email('Invalid email address'),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(8, { message: 'Password must contain at least 8 characters' })
    .max(32, { message: 'Password cannot exceed 32 characters' })
    .refine(
      (val) =>
        /^(?=.*[A-Z])(?=.*\d)(?=(.*\W){1})(?=.*[a-zA-Z])(?!.*\s).{8,32}$/.test(
          val,
        ),
      {
        message:
          'Password must contain at least one capital letter, a special character and a numeric digit',
      },
    ),
});

export const phoneNumberSchema = z.object({
  phone_number: z
    .string({
      required_error: 'Phone Number is required',
    })
    .refine(isValidPhoneNumber, { message: 'Invalid Phone Number' }),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, { message: 'Password must contain at least 8 characters' })
      .max(32, { message: 'Password cannot exceed 32 characters' })
      .refine(
        (val) =>
          /^(?=.*[A-Z])(?=.*\d)(?=(.*\W){1})(?=.*[a-zA-Z])(?!.*\s).{8,32}$/.test(
            val,
          ),
        {
          message:
            'Password must contain at least one capital letter, a special character and a numeric digit',
        },
      ),
    password_confirm: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, { message: 'Password must contain at least 8 characters' })
      .max(32, { message: 'Password cannot exceed 32 characters' })
      .refine(
        (val) =>
          /^(?=.*[A-Z])(?=.*\d)(?=(.*\W){1})(?=.*[a-zA-Z])(?!.*\s).{8,32}$/.test(
            val,
          ),
        {
          message:
            'Password must contain at least one capital letter, a special character and a numeric digit',
        },
      ),
  })
  .refine((data) => data.password === data.password_confirm, {
    path: ['password_confirm'],
    message: 'Passwords do not match',
  });

export const updatePhotoSchema = z.object({
  photo: z.string({
    required_error: 'Provide a Photo URL',
  }),
});

export const loginUserSchema = z.union([
  emailPasswordSchema,
  phoneNumberSchema,
]);

export const updateUserManagerSchema = z.object({
  managerId: z.string({
    required_error: 'Manager ID is required',
  }),
});

export const updateUserRoleSchema = z.object({
  role: z.literal('user').or(z.literal('manager')).or(z.literal('admin')),
});

export type RegisterUserInput = Omit<
  TypeOf<typeof registerUserSchema>,
  'password_confirm'
>;

export const createUserSchema = z.object({
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
      message:
        'Please enter a valid full name with one space between each word',
    }),
  date_of_birth: z
    .string({
      required_error: 'Date of birth is required',
      invalid_type_error: 'Date must be in DD/MM/YYYY format',
    })
    .refine(isValidDateFormat, {
      message: 'Date must be in DD/MM/YYYY format',
    })
    .refine(isAdult, {
      message: 'You must be at least 18 years old to sign up',
    })
    .refine(
      (val) => new Date(moment(val, DATE_FORMAT).toDate()) <= new Date(),
      {
        message: 'Date of birth cannot be in the future',
      },
    ),
  email: z
    .string({
      required_error: 'Email address is required',
      invalid_type_error: 'Invalid email address',
    })
    .email('Invalid email address'),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(8, { message: 'Password must contain at least 8 characters' })
    .max(32, { message: 'Password cannot exceed 32 characters' })
    .refine(
      (val) =>
        /^(?=.*[A-Z])(?=.*\d)(?=(.*\W){1})(?=.*[a-zA-Z])(?!.*\s).{8,32}$/.test(
          val,
        ),
      {
        message:
          'Password must contain at least one capital letter, a special character and a numeric digit',
      },
    ),
  phone_number: z
    .string({
      required_error: 'Phone Number is required',
    })
    .refine(isValidPhoneNumber, { message: 'Invalid Phone Number' }),
  sex: z.optional(z.string()),
  role: z.optional(
    z
      .literal('user')
      .or(z.literal('manager'))
      .or(z.literal('admin'))
      .or(z.string()),
  ),
  photo: z.optional(z.string()),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>;

export type LoginUserInput = TypeOf<typeof loginUserSchema>;
