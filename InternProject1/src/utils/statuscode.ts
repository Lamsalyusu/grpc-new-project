import * as grpc from "@grpc/grpc-js";
export const grpcStatusCode = (code: grpc.status) => {
  switch (code) {
    case grpc.status.OK:
      return { status: 200, message: "OK" };

    case grpc.status.CANCELLED:
      return { status: 400, message: "Request was cancelled" };

    case grpc.status.UNKNOWN:
      return { status: 500, message: "Unknown error occurred" };

    case grpc.status.INVALID_ARGUMENT:
      return { status: 400, message: "Invalid argument provided" };

    case grpc.status.DEADLINE_EXCEEDED:
      return { status: 408, message: "Request timed out" };

    case grpc.status.NOT_FOUND:
      return { status: 404, message: "Resource not found" };

    case grpc.status.ALREADY_EXISTS:
      return { status: 409, message: "Resource already exists" };

    case grpc.status.PERMISSION_DENIED:
      return { status: 403, message: "Permission denied" };

    case grpc.status.RESOURCE_EXHAUSTED:
      return { status: 429, message: "Resource exhausted" };

    case grpc.status.FAILED_PRECONDITION:
      return { status: 400, message: "Failed precondition" };

    case grpc.status.ABORTED:
      return { status: 409, message: "Request aborted" };

    case grpc.status.OUT_OF_RANGE:
      return { status: 400, message: "Out of range" };

    case grpc.status.UNIMPLEMENTED:
      return { status: 501, message: "Feature not implemented" };

    case grpc.status.INTERNAL:
      return { status: 500, message: "Internal server error" };

    case grpc.status.UNAVAILABLE:
      return { status: 503, message: "Service unavailable" };

    case grpc.status.DATA_LOSS:
      return { status: 500, message: "Data loss" };

    case grpc.status.UNAUTHENTICATED:
      return { status: 401, message: "Unauthenticated" };

    default:
      return { status: 500, message: "Unknown error" };
  }
};
