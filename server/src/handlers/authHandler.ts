import * as  grpc from '@grpc/grpc-js';
import { registerUser,loginUser } from '../service/authService';
import { findById } from '../repositories/userRepository';
import logger from "../utils/logger"

function getUserFromCall(call: any) {
  // console.log(call)
  const raw = call.metadata.get('user')[0] as string;
  // console.log(raw);
  return JSON.parse(raw);
}

const authHandlers = {
    Register :async (call:any, callback:any) => {
        try{
            const { name,email,password } = call.request;
            const result = await registerUser({name,email,password});  
            logger.info("gRPC registration successful")        
            callback(null,result);
        
          }catch(err:any){
            logger.error(`gRPC registation failed: ${err.message}`);
            callback({
                code: grpc.status.INTERNAL, 
                message: err.message || "Internal server error during registration."
            })
        }
    },

    Login: async(call: any, callback:any) =>{
        try {
          // console.log("REceived from gateway",call.request)
            const {email,password }= call.request;
            // console.log()
            const result = await loginUser({email,password});
            logger.info("gRPC login successful");
            callback(null,result);
            // console.log(result)
        } catch(err:any){
          logger.error(`gRPC login failed ${err.message}`);
            callback({
                code: grpc.status.UNAUTHENTICATED,
                message: err.message 
            })
          }
    },

    Me: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      // console.log(user) // identity from verified token, not call.request
      const result = await findById(user.id);
      // console.log(result)
      if (!result) {
        logger.warn("User profile not found");
        return callback({ code: grpc.status.NOT_FOUND, message: "user not found" });
      }
      logger.info("user profile fetched successfully")
      callback(null, result);
    }
    catch (err: any) {
      logger.error(`user profile not fetched ${err.message}`);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "Internal server error during fetching user info."
      })
        }
    }
}   

export default authHandlers;
