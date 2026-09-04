import grpc from '@grpc/grpc-js';
import { registerUser,loginUser } from '../../service/authService';
import { findById } from '../../repositories/userRepository';

function getUserFromCall(call: any) {
  const raw = call.metadata.get('user')[0] as string;
//   console.log("RAW METADATA FROM USER" ,JSON.parse(raw);
  return JSON.parse(raw);
}

const authHandlers = {
    Register :async (call:any, callback:any) => {
        try{
            const { name,email,password } = call.request;
            const result = await registerUser({name,email,password});
            // console.log("registered successfully")
            callback(null,result);
        }catch(err:any){
            callback({
                code: grpc.status.INTERNAL, 
                message: err.message || "Internal server error during registration."
            })
        }
    },

    Login: async(call: any, callback:any) =>{
        try {
            const {email,password }= call.request;
            const result = await loginUser({email,password});
            callback(null,result);
        } catch(err:any){
            callback({
                code: grpc.status.INTERNAL, 
                message: err.message || "Internal server error during logging."
            })
        }
    },

    Me: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call); // identity from verified token, not call.request
    //   console.log(user);
      const result = await findById(user.id);
      if (!result) {
        return callback({ code: grpc.status.NOT_FOUND, message: "user not found" });
      }
      callback(null, result);
    }
    catch (err: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "Internal server error during fetching user info."
      })
        }
    }
}   

export default authHandlers;
