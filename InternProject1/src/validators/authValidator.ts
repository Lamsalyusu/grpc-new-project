import { z } from 'zod';
import validator from 'validator';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name Must be at least 2 characters")
    .max(20, 'username mustnot exceed 20 characters')
    .transform((val) => validator.escape(val)),
  email: z.email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, 'password mustnot exceed more than 20 characters')
    .regex(/^\S+$/, "Password cannot contain spaces"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password is required")
    .max(20, 'password must not exceed more than 20 characters')
    .regex(/^\S+$/, "Password cannot contain spaces"),
});

export const adminUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(20, 'username mustnot exceed 20 characters')
    .optional(),
  email: z.email("Invalid email format").optional(),
  role: z.enum(["user", "admin"]).optional(),
}).refine((data) => data.name || data.email || data.role, {
  message: "At least one field must be provided",
  path: ["name"],
});

export type registerInput = z.infer<typeof registerSchema>;
export type loginInput = z.infer<typeof loginSchema>;
