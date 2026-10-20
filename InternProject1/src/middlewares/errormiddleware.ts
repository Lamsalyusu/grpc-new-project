import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { grpcStatusCode } from "../utils/statuscode";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(err);
  }

  const grpcCode = typeof err?.code === "number" ? err.code : undefined;
  const mappedError = grpcCode ? grpcStatusCode(grpcCode) : { status: err?.status || 500, message: "Internal server error" };
  const statusCode = Number(mappedError.status || err?.statusCode || 500);
  const message = err?.details || err?.message || mappedError.message || "Something went wrong";
  const details = err?.details || err?.errors || undefined;

  logger.error({
    level: "error",
    message: "Request failed",
    method: req.method,
    url: req.originalUrl,
    statusCode,
    grpcCode,
    errorMessage: message,
    details,
  });

  return res.status(statusCode).json({
    error: {
      code: statusCode,
      message,
      ...(details ? { details } : {}),
    },
  });
}

export default errorHandler;
