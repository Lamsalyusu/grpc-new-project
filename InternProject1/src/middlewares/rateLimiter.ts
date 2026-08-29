import rateLimiter from "express-rate-limit";
import { Request,Response } from "express";
const limit= rateLimiter({
  windowMs: 1 * 60 * 1000,   /// 1 MINUTE 
  // 3 choti maximum request garna payo 1 minute bhitra ma user le yo chai testing ko lagi yeti rakheko maile 
  max: 15,                     // limit each IP to 10 requests per window
  message: {
    error: {
      code: 429,
      message: "Too many requests, please try again later",
    },
  },
  standardHeaders: true, // modern, official guidelines standardized by the IETF
  // RateLimit-Limit: The maximum number of requests allowed inside the time window (e.g., 3).
  // RateLimit-Remaining: How many requests the user has left before getting blocked.
  // RateLimit-Reset: The exact number of seconds remaining until the current time window resets.
  //RateLimit-Limit: 3
// RateLimit-Remaining: 1
// RateLimit-Reset: 45
//reset chai kasari gara?????????????? 
  keyGenerator:(req:Request):string =>{
    return req.ip || req.headers['x-forwarded-for'] as string || 'unknown-ip';
  }  
});

export default limit;

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