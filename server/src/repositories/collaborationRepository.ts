// import { status } from "@grpc/grpc-js";
import collaboration_request from "../db/models/collaborationRequestModel";
// import sendRequ from "../service/collaborationService";

async function createRequest(data:{
    // id:string,
    // status:'pending'
    sender_id:string;
    receiver_id:string

}){
    return collaboration_request.create(data)
}

async function seeRequest(
    // id:string,
    // // status:'pending'
    // sender_id:string;
    receiver_id:string
){
   return collaboration_request.findAll({
    where:{
        // receiver_id:receiver_id,
        receiver_id,
        status:'pending'
        }
    });
}

async function findPendingRequest(
    sender_id:string,
    receiver_id:string
){
    return collaboration_request.findOne({
    where: {
      sender_id,
      receiver_id,
      status: "pending",
    },
  });
}

async function findRequestById(id: string) {
  return collaboration_request.findOne({
    where: {
      id,
    },
  });
}

async function acceptRequest(id:string,receiver_id:string){
    const [updatedRows] = await  collaboration_request.update(
        {
        status:'accepted'
        },
        {
        where:{
            // sender_id:sender_id,
            id,
            // receiver_id:receiver_id,
            receiver_id,
            status:'pending'
        }
    }
)
if(updatedRows === 0){
    return null;
}
// return updatedRows;
return findRequestById(id);
}

async function rejectRequest(id:string,receiver_id:string){
    const[updatedRows]= await collaboration_request.update(
        {
            status:'rejected'
        },
        {
            where:{
            id,
            receiver_id,
            status:'pending'
            }
        }
    )
    if(updatedRows ===0){
        return null;
    }
    return findRequestById(id);
}
export {createRequest,seeRequest,acceptRequest,rejectRequest,findPendingRequest,findRequestById};
