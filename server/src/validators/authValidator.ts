import { z } from 'zod';
import validator from 'validator';
export const registerSchema = z.object({
  name: z
  .string()
  .trim()
  .min(2, "Name Must be at least 2 characters")
  .max(20,'username mustnot exceed 20 characters')
  .transform((val) => validator.escape(val)),
  email: z
  .email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20,'password mustnot exceed more than 20 characters')
    .regex(/^\S+$/, "Password cannot contain spaces"),
});

export const loginSchema = z.object({
  email: z
  .email("Invalid email format"),
  password: z
  .string()
  .min(6, "Password is required")
  .max(20,'password must not exceed more than 20 characters')
  .regex(/^\S+$/, "Password cannot contain spaces"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
