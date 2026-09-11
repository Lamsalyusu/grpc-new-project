import {z} from 'zod';
export const notificationValidationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});
export type NotificationQueryInput = z.infer<typeof notificationValidationSchema>;