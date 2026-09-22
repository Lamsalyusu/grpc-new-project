import {Request,Response,NextFunction} from 'express';
import { taskcollaboratorvalidation } from '../validators/taskCollaboratorValidator';
import taskCollaboratorClient from '../grpc-client/taskCollaboratorClient';
import {buildMetadata} from './grpcMetadata';
import logger from '../utils/logger';
// import { grpcStatusCode } from "../utils/statuscode";

const taskCollaboratorController = {

    create:async(req:Request,res:Response,next:NextFunction) => {
            const {email}= req.body as taskcollaboratorvalidation;
            //task id chai parameter bata aauxa hai
            const task_id = req.params.id as string;
            //reqid chai new add garne collaborator ko id ho 
            const reqid = (req as any).user.id;
            const md = buildMetadata(req);
            taskCollaboratorClient.CreateCollaborator({task_id,reqid,email},md,(err:any,result:any)=>{
                if(err){
                    // return res.status(err.code === 409 ? 409 : 500).json({error:{message:err.message || "collaborator creation failed"}});
                //     const errorInfo = grpcStatusCode(err.code);
                //     return res.status(errorInfo.status).json({
                //     message:err.details || errorInfo.message
                //  });
                return next(err);
                }
                logger.info("Task collaborator added in the task")
                return res.status(201).json({data:result,message:'collaborator added successfully'});
            });
    },

    getCollaborator:async(req:Request,res:Response,next:NextFunction)=>{
            //task id chai parameter bata aauxa hai
            const task_id = req.params.id as string;
            //reqid chai new add garne collaborator ko id ho 
            const reqid = (req as any).user.id;
            const md = buildMetadata(req);
            taskCollaboratorClient.GetCollaborators({task_id,reqid},md,(err:any,result:any)=>{
                if(err){
                    // return res.status(err.code === 409 ? 409 : 500).json({error:{message:err.message || "collaborator fetching failed"}});
                    // const errorInfo = grpcStatusCode(err.code);
                    // return res.status(errorInfo.status).json({
                    // message:err.details || errorInfo.message
                    // });
                    return next(err);
                }
                logger.info("task collaborator retrieved successfully")
                return res.status(200).json({data:result,message:'fetched collaborator'});
            });
        },

    deleteCollaborators:async(req:Request,res:Response,next:NextFunction)=>{
             //task id chai parameter bata aauxa hai
            const task_id = req.params.id as string;
            //reqid chai new add garne collaborator ko id ho 
            const reqid = (req as any).user.id;
            const md = buildMetadata(req);
            const user_id = req.params.userId as string;
            taskCollaboratorClient.DeleteCollaborator({task_id,reqid,user_id},md,(err:any,result:any)=>{
                if(err){
                    // return res.status(err.code === 409 ? 409 : 500).json({error:{message:err.message || "collaborator deletion failed"}});
                    // const errorInfo = grpcStatusCode(err.code);
                    // return res.status(errorInfo.status).json({
                    // message:err.details || errorInfo.message
                    // });
                    return next(err);
                }
                logger.info("task collaborator deleted")
                return res.status(200).json({data:result,message:'deleted collaborator successfully'});
            });
    },

    getSharedTasks: async (req: Request, res: Response,next:NextFunction) => {
            const user_id = (req as any).user.id;
            const md = buildMetadata(req);
            taskCollaboratorClient.GetSharedTasks({user_id}, md, (err: any, result: any) => {
                if (err) {
                    // return res.status(err.code === 409 ? 409 : 500).json({ error: { message: err.message || "Failed to retrieve shared tasks" } });
                    // const errorInfo = grpcStatusCode(err.code);
                    // return res.status(errorInfo.status).json({
                    // message:err.details || errorInfo.message
                    // });
                    return next(err);
                }
                logger.info("shared tasks retrieved succesfully")
                return res.status(200).json({ data: result, message: 'Shared tasks retrieved successfully' });
        });
    }
}
export default taskCollaboratorController;