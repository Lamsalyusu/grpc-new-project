
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

function validation(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 400,
          message: "Invalid input",
          details: result.error.flatten().fieldErrors,
        },
      });
    }

    req.body = result.data;
    next();
  };
}

function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 400,
          message: "Invalid input",
          details: result.error.flatten().fieldErrors,
        },
      });
    }

    (req as any).validatedQuery = result.data;
    next();
  };
}

function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 400,
          message: "Invalid input",
          details: result.error.flatten().fieldErrors,
        },
      });
    }
    next();
  };
}

export { validation, validateQuery, validateParams };
