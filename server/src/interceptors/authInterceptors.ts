import * as grpc from "@grpc/grpc-js";
import { verifyToken } from "../utils/jwt";
import logger from "../utils/logger";

const EXEMPT_PATHS = [
  "/authPackage.authService/registerUser",
  "/authPackage.authService/loginUser",
  "/adminPackage.adminService/loginAdmin",
  "/reminderPackage.reminderService/checkDueReminders",
];

const RATE_WINDOWS = new Map<string, { startedAt: number; count: number }>();
let requestsSinceCleanup = 0;

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = RATE_WINDOWS.get(key);

  if (!current || now - current.startedAt >= windowMs) {
    RATE_WINDOWS.set(key, { startedAt: now, count: 1 });
  } else {
    current.count += 1;
    if (current.count > limit) return true;
  }

  requestsSinceCleanup += 1;
  if (requestsSinceCleanup >= 500) {
    for (const [rateKey, window] of RATE_WINDOWS) {
      if (now - window.startedAt > 15 * 60 * 1000) RATE_WINDOWS.delete(rateKey);
    }
    requestsSinceCleanup = 0;
  }

  return false;
}

const authInterceptor = (methodDescriptor: any, call: any) => {
  const method = methodDescriptor.path || "unknown";
  const peer = (call.getPeer?.() || "unknown-peer").replace(/:\d+$/, "");
  const authRequest = /\/(registerUser|loginUser|registerAdmin|loginAdmin)$/.test(method);
  const limited = isRateLimited(
    `${authRequest ? "auth" : "rpc"}:${peer}`,
    authRequest ? 10 : 120,
    authRequest ? 15 * 60 * 1000 : 60 * 1000,
  );

  logger.info({ message: "gRPC request received", method, peer });

  if (limited) {
    logger.warn({ message: "gRPC rate limit exceeded", method, peer });
    call.sendStatus({
      code: grpc.status.RESOURCE_EXHAUSTED,
      details: "Too many requests. Please try again later.",
    });
    return new grpc.ServerInterceptingCall(call);
  }

  // 1. If the path is exempt, completely bypass interception
  if (EXEMPT_PATHS.includes(methodDescriptor.path)) {
    return new grpc.ServerInterceptingCall(call);
  }

  const listener = new grpc.ServerListenerBuilder()
    .withOnReceiveMetadata((metadata: any, next: any) => {
      const authorization = metadata.get("authorization");
      if (!authorization || authorization.length === 0) {
        logger.warn({ message: "gRPC authorization metadata missing", method, peer });
        return call.sendStatus({
          code: grpc.status.UNAUTHENTICATED,
          details: "Token not found",
        });
      }

      const authString = authorization[0] as string;
      const token = authString.split(" ")[1];

      if (!token) {
        return call.sendStatus({
          code: grpc.status.UNAUTHENTICATED,
          details: "Token not found",
        });
      }

      try {
        const decoded = verifyToken(token);
        metadata.set("user", JSON.stringify(decoded));
        next(metadata);
      } catch (error) {
        logger.warn({ message: "gRPC authorization rejected", method, peer });
        return call.sendStatus({
          code: grpc.status.UNAUTHENTICATED,
          details: "Invalid or expired token",
        });
      }
    })
    .build();

  const responder = new (grpc as any).ResponderBuilder()
    .withStart((next: any) => {
      next(listener);
    })
    .build();

  return new grpc.ServerInterceptingCall(call, responder);
};

export default authInterceptor;
