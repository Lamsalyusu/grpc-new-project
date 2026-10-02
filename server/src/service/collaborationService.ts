import { findByEmail, findById } from "../repositories/userRepository";
import {createRequest,acceptRequest,rejectRequest,seeRequest,findPendingRequest,findRequestById,doubleRequest,findAcceptedCollaborators,deleteCollaborators} from '../repositories/collaborationRepository';
import {  RequestType } from "../validators/collaborationReqvalidation";
// import { col } from "sequelize";

async function sendRequest(sender_id:string,data:RequestType){
    const receiver = await findByEmail(data.receiver_email)

    // if(!receiver){
    //     throw { message:"user not found" };
    // }

     if (!receiver) {
    throw new Error("User not found");
  }

   if (sender_id === receiver.id) {
    throw new Error("You cannot send a collaboration request to yourself");
  }
  
    const double_request = await doubleRequest(sender_id, receiver.id)
    if(double_request){
        throw new Error("Can't send request twice you are already added to this user");
    }

    const existingRequest = await findPendingRequest(
        sender_id,
        receiver.id
    );

    if (existingRequest) {
        throw new Error("Collaboration request already sent");
    }

    const request = await createRequest({
        sender_id,
        receiver_id:receiver.id,
    })
    return request;
}

async function viewRequest(receiver_id:string){
    // const receiver = await findById(receiver_id)
    // if(!receiver){
    //     throw{message:'user not found'}
    // }
    // return seeRequest(receiver_id);
    const requests = await seeRequest(receiver_id)
    return requests;
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

async function viewCollaborationRequest(user_id:string){
    const relationships = await findAcceptedCollaborators(user_id);
    const collaborators = await Promise.all(
        relationships.map(async(relationship)=>{
            const collaborator_id = relationship.sender_id === user_id ? relationship.receiver_id
                    : relationship.sender_id;
            const collaborator = await findById(collaborator_id);

            return {
                id:collaborator?.id,
                name:collaborator?.name,
                email:collaborator?.email
            }

        })
    
    )
    return collaborators;

}

async function deleteCollaborator(currentUserId:string,targetUserId:string){
    
    
    // const accepted = await findAcceptedCollaborators(currentUserId);
    // if(!accepted){
    //     throw new Error("Collaborator not found")
    // }
    // await deleteCollaborators(currentUserId,targetUserId);
    // return {
    //     message:"collaborators deleted successfully"
    // }
        const deleted = await deleteCollaborators(
            currentUserId,
            targetUserId
        );
        // destroy in repository returns number of rows that were deleted.
        // so if deleted = 1 1 === 0 is false 
        if (deleted === 0) {
            throw new Error("Collaborator not found");
        }
        return {
            message: "Collaborator deleted successfully"
        };
}

export {sendRequest,viewRequest,acceptReq,rejectReq,viewCollaborationRequest,deleteCollaborator};
