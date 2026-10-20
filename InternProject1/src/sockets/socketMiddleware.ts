import { Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";
import logger from "../utils/logger";

const handshakeWindows = new Map<string, { startedAt: number; count: number }>();
const HANDSHAKE_LIMIT = 30;
const HANDSHAKE_WINDOW_MS = 60 * 1000;

// Middleware to authenticate incoming connections
function socketMiddleware(socket: Socket, next: (err?: Error) => void) {
  const address = socket.handshake.address || "unknown-address";
  const now = Date.now();
  const current = handshakeWindows.get(address);

  if (!current || now - current.startedAt >= HANDSHAKE_WINDOW_MS) {
    handshakeWindows.set(address, { startedAt: now, count: 1 });
  } else if (current.count >= HANDSHAKE_LIMIT) {
    logger.warn({ message: "Socket handshake rate limit exceeded", address });
    next(new Error("Too many connection attempts. Please try again shortly."));
    return;
  } else {
    current.count += 1;
  }

  // Extract data passed from the client during handshake
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error:No token provided"));
  }
  try {
    const decode = verifyToken(token);
    (socket as any).data.user = decode;
    (socket as any).data.token = token; // raw JWT, needed to forward as gRPC metadata
    // Now, socket.data.user literally equals:
    //socket as any .data.user --> { id: '1e61b247-bfe1-4e39-8272-7631ba4cb237',email: 'testuser@example.com',iat: 1785134931, exp: 1785221331}
    //the decode becomes the user data
    // Now, socket.data.user literally equals:
    // {
    // id: '1e61b247-bfe1-4e39-8272-7631ba4cb237'_,
    // email: 'testuser@example.com',
    // iat: 1785134931,
    // exp: 1785221331
    // }
    next();
  } catch (err) {
    next(new Error("Authentication Error:token invalid or expired"));
  }
}
export default socketMiddleware;
