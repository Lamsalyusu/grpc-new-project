import grpc from '@grpc/grpc-js';
import { registerUser,loginUser } from '../../service/authService';

const authHandlers = {
    Register :async (call:any, callback:any) => {
        try{
            const { name,email,password } = call.request;
            const result = await registerUser({name,email,password});
            // console.log("registered successfully")
            callback(null,result);
        }catch(err:any){
            callback({
                // code: grpc.status.INTERNAL, 
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
                // code: grpc.status.INTERNAL, 
                message: err.message || "Internal server error during logging."
            })
        }
    }
}

export default authHandlers;
