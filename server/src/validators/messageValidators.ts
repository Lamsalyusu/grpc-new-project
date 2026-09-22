import {z} from 'zod';
import validator from 'validator'
export const messageValidationSchema = z.object({
    body:z
    .string()
    .min(2,'must be minimum of 2 character')
    .max(1000,'must not exceed 1000 characters')
    .transform((val) => validator.escape(val))
});

export type MessageValidation = z.infer<typeof messageValidationSchema>;