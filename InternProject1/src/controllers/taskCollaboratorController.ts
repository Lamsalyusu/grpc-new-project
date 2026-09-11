import {Request,Response,NextFunction} from 'express';
import { taskcollaboratorvalidation } from '../validators/taskCollaboratorValidator';
import taskCollaboratorClient from '../grpc-client/taskCollaboratorClient';
import {buildMetadata} from './grpcMetadata';
const taskCollaboratorController = {

    create:async(req:Request,res:Response) => {
            const {email}= req.body as taskcollaboratorvalidation;
            //task id chai parameter bata aauxa hai
            const task_id = req.params.id as string;
            //reqid chai new add garne collaborator ko id ho 
            const reqid = (req as any).user.id;
            const md = buildMetadata(req);
            taskCollaboratorClient.CreateCollaborator({task_id,reqid,email},md,(err:any,result:any)=>{
                if(err){
                    return res.status(err.code === 409 ? 409 : 500).json({error:{message:err.message || "collaborator creation failed"}});
                }
                return res.status(201).json({data:result,message:'collaborator added successfully'});
            });
    },

    getCollaborator:async(req:Request,res:Response)=>{
            //task id chai parameter bata aauxa hai
            const task_id = req.params.id as string;
            //reqid chai new add garne collaborator ko id ho 
            const reqid = (req as any).user.id;
            const md = buildMetadata(req);
            taskCollaboratorClient.GetCollaborators({task_id,reqid},md,(err:any,result:any)=>{
                if(err){
                    return res.status(err.code === 409 ? 409 : 500).json({error:{message:err.message || "collaborator fetching failed"}});
                }
                return res.status(200).json({data:result,message:'fetched collaborator'});

            });
    },

    deleteCollaborators:async(req:Request,res:Response)=>{
             //task id chai parameter bata aauxa hai
            const task_id = req.params.id as string;
            //reqid chai new add garne collaborator ko id ho 
            const reqid = (req as any).user.id;
            const md = buildMetadata(req);
            const user_id = req.params.userId as string;
            taskCollaboratorClient.DeleteCollaborator({task_id,reqid,user_id},md,(err:any,result:any)=>{
                if(err){
                    return res.status(err.code === 409 ? 409 : 500).json({error:{message:err.message || "collaborator deletion failed"}});
                }
                return res.status(200).json({data:result,message:'deleted collaborator successfully'});
            });
    },

    getSharedTasks: async (req: Request, res: Response) => {
            const user_id = (req as any).user.id;
            const md = buildMetadata(req);
            taskCollaboratorClient.GetSharedTasks({user_id}, md, (err: any, result: any) => {
                if (err) {
                    return res.status(err.code === 409 ? 409 : 500).json({ error: { message: err.message || "Failed to retrieve shared tasks" } });
                }
                return res.status(200).json({ data: result, message: 'Shared tasks retrieved successfully' });
        });
    }
}
export default taskCollaboratorController;