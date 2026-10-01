import {z} from 'zod';
export const collaboratorschema = z.object({
    // email:z.email("invalid email format"),
    user_id: z.uuid("Must be a uuid value")
}).strict();
export type taskcollaboratorvalidation = z.infer<typeof collaboratorschema>;