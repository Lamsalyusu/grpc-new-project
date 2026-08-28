import {z} from 'zod';
import validator from 'validator';
// taskSchema --> "is the task data itself valid"
export const taskSchema = z.object({
    title:z
    .string()
    .trim()
    .min(1,"title is reqired")
    .max(20,'title must not exceed 50 chars')
    .transform((val) => validator.escape(val)),
    description:z
    .string()
    .trim()
    .min(20,'description is mininum 20 chars required')
    .max(100,'max charcters can exceed 50')
    .optional()
    .transform((val) => (val ? validator.escape(val) : val)),
    status:z.
    enum(["pending","completed","in_progress"]).optional(),
    priority:z.enum(["low","medium","high"]).optional(),
    due_date: z.string().datetime().optional(),
    reminder_at: z.string().datetime().optional(),
});

// taskQuery --> are the instructions for fetching.filtering a list of tasks valid?
export const taskQuery = z.object({
    status:z.enum([ "pending","completed","in_progress"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    sortBy: z.enum(["due_date", "priority", "created_at"]).optional().default("created_at"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
})
export type Taskrequire = z.infer<typeof taskSchema>;
export type taskqueryschema = z.infer<typeof taskQuery>;