import { Request, Response, NextFunction } from "express";
// import AuthClient from "../grpc-client/authClient";
import { RequestType } from "../validators/collaborationReqvalidation";
import { buildMetadata } from "./grpcMetadata";
// import logger from "../utils/logger";
import CollaborationClient from "../grpc-client/collaborationClient";

const CollaborationController = {

    sendReq: async(req:Request,res:Response,next:NextFunction)=>{
        const {receiver_id} = req.body as RequestType;
        const md = buildMetadata(req)
        CollaborationClient.sendRequest({receiver_id},md,(err:any,response:any)=>{
            if(err){
                return next(err);
            }
            return res.status(201).json({data:response,message:'request sent successfully'})
        })
    },

    seeReq:async (req:Request, res:Response, next:NextFunction)=>{
        // const {receiver_id} = req.body as RequestType;
        const md = buildMetadata(req);
        CollaborationClient.seeRequest({},md,(err:any,response:any)=>{
            if(err){
                return next(err);
            }
            return res.status(200).json({data:response,message:'request viewed'})
        })
    },

    acceptReq:async(req:Request,res:Response,next:NextFunction)=>{
        // const {receiver_id} = req.body as RequestType;
        const {id} = req.params;
        const md = buildMetadata(req);
        CollaborationClient.acceptRequest(
            {id},
            md,
            (err:any,response:any)=>{
            if(err){
                return next(err);
            }
            return res.status(200).json({
                data:response,message:'request accepted'
            })
        });
    },

    rejectReq:async(req:Request,res:Response,next:NextFunction)=>{
        // const {receiver_id} = req.body as RequestType;
        const {id} = req.params;
        const md = buildMetadata(req);
        CollaborationClient.rejectRequest(
            {id},
            md,
            (err:any,response:any)=>{
            if(err){
                return next(err);
            }
            return res.status(200).json({
                data:response,message:'request rejected'
            })
        });
    }
}
export default CollaborationController;