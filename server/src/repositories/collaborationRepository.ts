// import { status } from "@grpc/grpc-js";
import { Op } from "sequelize";
import collaboration_request from "../db/models/collaborationRequestModel";
import { findById } from "./userRepository";
// import { userInfo } from "node:os";
// import sendRequ from "../service/collaborationService";

async function createRequest(data:{
    // id:string,
    // status:'pending'
    sender_id:string;
    receiver_id:string

}){
    return collaboration_request.create(data)
}

// ==============================================================================================================================================================

async function seeRequest(
    // id:string,
    // // status:'pending'
    // sender_id:string;
    receiver_id:string
){
   const requests = await collaboration_request.findAll({
    where:{
        // receiver_id:receiver_id,
        receiver_id,
        status:'pending'
        }
    });

    console.log(requests);
    // const sendername = await findById(requests.map(reqs=>{
    //     reqs.sender_id
    // }));

// const sendername = await requests.map(async(req)=>{
//     const sender = await findById(req.sender_id);
//     return {
//         requests:req,
//         sender_name :sender?.name,
//     }
// })

 const sendername = await Promise.all(
        requests.map(async (req) => {
            const sender = await findById(req.sender_id);

            return {
                // request: req,
                id: req.id,
                sender_id: req.sender_id,
                receiver_id: req.receiver_id,
                status: req.status,
                sender_name: sender?.name,
                // sender_name: sender?.name,
            };
        })
    );
// console.log(sendername)
console.log(sendername)
return sendername;

}

// ==============================================================================================================================================================

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


// async 
// ================================================================================================================================================================

async function findRequestById(id: string) {
  return collaboration_request.findOne({
    where: {
      id,
    },
  });
}

// ================================================================================================================================================================

// async function sendername(sender_id:string){
//     const sender_name = await findById(sender_id)
// }

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

// ================================================================================================================================================================


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

async function doublerequest(
    user_id1:string,user_id2:string
){
    return collaboration_request.findOne({
        where:{
            status:"accepted",
            [Op.or]:[
                {
                    sender_id:user_id1,
                    receiver_id:user_id2
                },
                {
                    sender_id:user_id2,
                    receiver_id:user_id1
                },
            ],
        },
    });
}

export {createRequest,seeRequest,acceptRequest,rejectRequest,findPendingRequest,findRequestById,doublerequest};
