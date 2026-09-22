import winston from "winston";

const { format } = winston;

const logger = winston.createLogger({
    // determined common winston levels like error , warn , info , http, verbose , debug, silly
    // Use LOG_LEVEL from the environment. If it doesn't exist, use "info".
  level: process.env.LOG_LEVEL || "info",

// This defines the default format for logs.
  format: format.combine(
    // Adds a timestamp.you can get something like:
    // Instead of server started 
    // 2026-09-16 10:30:15 Server started
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    // The stack is extremely useful because it tells you where the error happened.
    format.errors({ stack: true }),
    // This supports printf-style interpolation.
    // logger.info("User %s logged in", username);
    // User Yuyutsu logged in
    format.splat(),
    // It formats the log as JSON.
    format.json()
  ),

  transports: [
    new winston.transports.Console({
      level: "info",
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    }),

    new winston.transports.File({
        // Server started
        // User logged in
        // Database connected
        // Something went wrong
      filename: "logs/info.log",
      level: "info",
    }),

    new winston.transports.File({

        // It only receives:
        // error
      filename: "logs/error.log",
      level: "error",
    }),
  ],

  exceptionHandlers: [
    new winston.transports.Console({
      format: format.simple(),
    }),

    new winston.transports.File({
      filename: "logs/exceptions.log",
    }),
  ],

  rejectionHandlers: [
    // This handles unhandled Promise rejections.
    new winston.transports.Console({
      format: format.simple(),
    }),

    new winston.transports.File({
      filename: "logs/rejections.log",
    }),
  ],
});

export default logger;