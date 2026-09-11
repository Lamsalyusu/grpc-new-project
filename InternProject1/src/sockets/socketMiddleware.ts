import {Socket } from "socket.io";
import { verifyToken } from '../utils/jwt';
// Middleware to authenticate incoming connections
function socketMiddleware(socket:Socket,next:(err?:Error)=>void){
  // Extract data passed from the client during handshake
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error:No token provided'))
  } 
  try{
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
  }
  catch(err){
    next (new Error('Authentication Error:token invalid or expired'))
  }
};
export default socketMiddleware;
