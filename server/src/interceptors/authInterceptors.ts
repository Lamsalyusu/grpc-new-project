import * as grpc from "@grpc/grpc-js";
import { verifyToken } from "../utils/jwt";

const EXEMPT_PATHS = [
  "/authPackage.auth/Register",
  "/authPackage.auth/Login",
    "/grpc.reflection.v1.ServerReflection/ServerReflectionInfo"
];

const authInterceptor = (methodDescriptor: any, call: any) => {
  // 1. If the path is exempt, completely bypass interception
  if (EXEMPT_PATHS.includes(methodDescriptor.path)) {
    return new grpc.ServerInterceptingCall(call);
  }

  const listener = new grpc.ServerListenerBuilder()
    .withOnReceiveMetadata((metadata: any, next: any) => {
      const authorization = metadata.get("authorization");
      
      if (!authorization || authorization.length === 0) {
        // Abort the call by passing an error status to the responder
        return call.sendStatus({ code: grpc.status.UNAUTHENTICATED, details: "Token not found" });
      }

      const authString = authorization[0] as string;
      const token = authString.split(" ")[1];

      if (!token) {
        return call.sendStatus({ code: grpc.status.UNAUTHENTICATED, details: "Token not found" });
      }

      try {
        const decoded = verifyToken(token);
        // Pass decoded token down to the actual service handler via metadata
        metadata.set("user", JSON.stringify(decoded));
        next(metadata);
      } catch (error) {
        return call.sendStatus({ code: grpc.status.UNAUTHENTICATED, details: "Invalid or expired token" });
      }
    })
    .build()

  const responder = new (grpc as any).ResponderBuilder()
    .withStart((next: any) => {
      next(listener);
    })
    .build();

  return new grpc.ServerInterceptingCall(call, responder);
};

export default authInterceptor;
