import { z } from 'zod';
import validator from 'validator';
export const requestSchema = z.object({
    // sender_id:z.uuid("invalid id format"),
    receiver_id:z.uuid("invalid id format")
});
export type RequestType = z.infer<typeof requestSchema>;