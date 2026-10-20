import rateLimiter from "express-rate-limit";
import logger from "../utils/logger";

const baseLimiterOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: any, res: any, _next: any, options: any) => {
    logger.warn({
      message: "HTTP rate limit exceeded",
      method: req.method,
      path: req.path,
      ip: req.ip,
    });
    res.status(options.statusCode).json(options.message);
  },
  message: {
    error: {
      code: 429,
      message: "Too many requests, please try again later",
    },
  },
};

const authLimiter = rateLimiter({
  ...baseLimiterOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
});

const adminLimiter = rateLimiter({
  ...baseLimiterOptions,
  windowMs: 15 * 60 * 1000,
  limit: 60,
});

const apiLimiter = rateLimiter({
  ...baseLimiterOptions,
  windowMs: 60 * 1000,
  limit: 120,
});

export { authLimiter, adminLimiter, apiLimiter };
export default apiLimiter;

// in case of somone is hiding their ips track their account ID rather than their IP address. It does not matter if they switch VPN locations 100 times; if they are logged into the user account user_9876, they still only get

// keyGenerator: (req: Request) => {
//   // If logged in, lock the rate limit to their database ID
//   return req.user?.id || req.ip;
// }

// ------------------------------------------------------------------------------------
// in case of internal server
//Endpoints like /api/login or /api/signup are the most targeted routes for cyberattacks. Without an IP fallback, you would have no way to rate limit these pages, opening the door to two dangerous issues:

// import rateLimiter from "express-rate-limit";
// import { Request } from "express";

// // 1. Extend the Request interface to support your user object type
// interface AuthenticatedRequest extends Request {
//   user?: {
//     id: string; // The unique user ID from database or JWT
//   };
// }

// // 2. Create the rate limiter
// const internalUserLimiter = rateLimiter({
//   windowMs: 1 * 60 * 1000, // 1 Minute
//   max: 3,                  // Exactly 3 requests per user account
//   message: {
//     error: { code: 429, message: "You have exceeded your limit of 3 requests per minute." }
//   },
//   standardHeaders: true,
//   // Use the User ID as the tracking key
//   keyGenerator: (req: AuthenticatedRequest): string => {
//     if (req.user && req.user.id) {
//       return `user:${req.user.id}`;
//     }
//     // Fallback to IP ONLY for public endpoints (like login page)
//     return `ip:${req.ip || 'unknown'}`;
//   }
// });

// export default internalUserLimiter;
// ------------------------------------------------------------------------------------
