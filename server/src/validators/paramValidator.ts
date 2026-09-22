// validators/paramValidator.ts
import { z } from "zod";

export const taskIdParamSchema = z.object({
  id: z.uuid("Invalid task id format"),
});

export const collaboratorParamsSchema = z.object({
  id: z.uuid("Invalid task id format"),
  userId: z.uuid("Invalid user id format"),
});