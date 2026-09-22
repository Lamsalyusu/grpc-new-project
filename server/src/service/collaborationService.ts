import { findById } from "../repositories/userRepository";
import {createRequest,acceptRequest,rejectRequest,seeRequest,findPendingRequest,findRequestById} from '../repositories/collaborationRepository';
import {  RequestType } from "../validators/collaborationReqvalidation";

async function sendRequest(sender_id:string,data:RequestType){
    const receiver = await findById(data.receiver_id)

    // if(!receiver){
    //     throw { message:"user not found" };
    // }

     if (!receiver) {
    throw new Error("User not found");
  }

   if (sender_id === data.receiver_id) {
    throw new Error("You cannot send a collaboration request to yourself");
  }

    const existingRequest = await findPendingRequest(
        sender_id,
        data.receiver_id
    );

    if (existingRequest) {
        throw new Error("Collaboration request already exists");
    }

    const request = await createRequest({
        sender_id,
        receiver_id:data.receiver_id,
    })
    return request;
}

async function viewRequest(receiver_id:string){
    // const receiver = await findById(receiver_id)
    // if(!receiver){
    //     throw{message:'user not found'}
    // }
    return seeRequest(receiver_id);
    // return view;
}

async function acceptReq(request_id:string,receiver_id:string){
    // const receiver = await findById(receiver_id);
    const request = await findRequestById(request_id);
    if(!request){
        throw new Error("Collaboration request not found");
    }

  if (request.receiver_id !== receiver_id) {
    throw new Error("You are not allowed to accept this request");
  }

  if (request.status !== "pending") {
    throw new Error("Collaboration request is no longer pending");
  }
    const accepted = await acceptRequest(request_id,receiver_id);
    if (!accepted) {
    throw new Error("Could not accept collaboration request");
    }
    return accepted;
}

async function rejectReq(request_id:string,receiver_id:string){
    const request = await findRequestById(request_id);

    if(!request){
         throw new Error("Collaboration request not found");
    }
    if (request.receiver_id !== receiver_id) {
        throw new Error("You are not allowed to reject this request");
    }

    if (request.status !== "pending") {
    throw new Error("Collaboration request is no longer pending");
    }
    
    const rejected = await rejectRequest(
    request_id,
    receiver_id
    );

    if (!rejected) {
    throw new Error("Could not reject collaboration request");
  }

  return rejected;
}
    // const reject = await rejectRequest(sender_id,receiver_id);







export {sendRequest,viewRequest,acceptReq,rejectReq};
