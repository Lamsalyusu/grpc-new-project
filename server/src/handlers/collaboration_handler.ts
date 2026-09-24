import {sendRequest,acceptReq,rejectReq,viewRequest} from "../service/collaborationService";
// import createRequest from "../repositories/collaborationRepository";
import * as grpc from '@grpc/grpc-js'

function getUserFromCall(call: any) {
  const raw = call.metadata.get('user')[0] as string;
  return JSON.parse(raw);
}

const collaboration_handler = {
    sendRequest :async(call:any, callback:any)=>{
        try{
            const user = getUserFromCall(call);
            const sender_id = user.id;
            // const {receiver_id} = call.request;
            const {receiver_email} = call.request;
            // const request = await sendRequest(sender_id,{receiver_id})
            const request = await sendRequest(sender_id,{receiver_email})
            callback(null,request)
        }catch(err:any){
            callback({
                code:grpc.status.INTERNAL,
                message:err.message || "couldnot sent request"
            })
        }
    },
    seeRequest:async(call:any, callback:any)=>{
        try{
            const user = getUserFromCall(call);
            // const sender_id = user.id;
            const receiver_id = user.id;
            // const {receiver_id} = call.request;
            const request = await viewRequest(receiver_id);
            callback(null,{reqs:request})
        }catch(err:any){
            callback({
                code:grpc.status.INTERNAL,
                message:err.message||"couldnot view request"
            })
        }
        
    },
    acceptRequest:async(call:any, callback:any)=>{
        try {
            const user = getUserFromCall(call);
            const receiver_id = user.id;
            const {id} = call.request;
            const request = await  acceptReq(id,receiver_id);
            // console.log(request);
            callback(null,{
                accept:[request]
            })
        }catch(err:any){
            callback
            ({
            code:grpc.status.INTERNAL,
            message:err.message||"couldnot view request"
            })
        }
    },
    rejectRequest:async(call:any,callback:any)=>{
        const user = getUserFromCall(call);
           try {
            // const sender_id = user.id;
            // const {receiver_id} = call.request;
            const receiver_id = user.id;
            const {id} = call.request;
            const request = await  rejectReq(id,receiver_id);
            callback(null,{
                reject:[request]
            })
        }
        catch(err:any){
            callback
            ({
            code:grpc.status.INTERNAL,
            message:err.message||"couldnot view request"
            })
        }
    }
}
export default collaboration_handler;