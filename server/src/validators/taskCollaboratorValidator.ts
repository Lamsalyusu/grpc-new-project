import {z} from 'zod';
export const collaboratorschema = z.object({
    email:z.email("invalid email format"),
}).strict();
export type taskcollaboratorvalidation = z.infer<typeof collaboratorschema>;