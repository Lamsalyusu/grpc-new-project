import {Request,Response,NextFunction} from 'express';
import { taskcollaboratorvalidation } from '../validators/taskCollaboratorValidator';
import { createTaskCollaborator,deleteTaskCollaborator,getCollaboratorsByTask,getTasksSharedWithUser} from '../services/taskCollaboratorServices';
const taskCollaboratorController = {
    create:async(req:Request,res:Response,next:NextFunction)=>{
        try{
            const {email}= req.body as taskcollaboratorvalidation;
            //task id chai parameter bata aauxa hai
            const task_id = req.params.id as string;
            //reqid chai new add garne collaborator ko id ho 
            const reqid = (req as any).user.id;

            const result = await createTaskCollaborator(task_id,reqid,email);
            return res.status(201).json({data:result,message:'collaborator added successfully'});
        }
        catch(error:any){
            // return res.status(error.status || 500).json({error:{message:error.message ||'something went wrong'}})
            next(error);
        }
    },
    getCollaborator:async(req:Request,res:Response,next:NextFunction)=>{
        try{
            //task id chai parameter bata aauxa hai
            const task_id = req.params.id as string;
            //reqid chai new add garne collaborator ko id ho 
            const reqid = (req as any).user.id;
            const result = await getCollaboratorsByTask(task_id,reqid);
            return res.status(200).json({data:result,message:'fetched collaborator'});
        }
        catch(error:any){
            // return res.status(error.status || 500 ).json({error:{message:error.message || 'something went wrong' }})
            next(error);
        }
    },
    deleteCollaborators:async(req:Request,res:Response,next:NextFunction)=>{
        try{
             //task id chai parameter bata aauxa hai
            const task_id = req.params.id as string;
            //reqid chai new add garne collaborator ko id ho 
            const reqid = (req as any).user.id;
            // 
            const user_id = req.params.userId as string;
            const delcoab = await deleteTaskCollaborator(task_id,reqid,user_id);
            return res.status(200).json({data:delcoab,message:'deleted collaborator successfully'});
        }
        catch(error:any){
            // return res.status(error.status || 500).json({error:{message:error.message || 'something went wrong'}});
            next(error);
        }
    },
    getSharedTasks: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user_id = (req as any).user.id;
            const result = await getTasksSharedWithUser(user_id);
            return res.status(200).json({ data: result, message: 'Shared tasks retrieved successfully' });
        } catch (error: any) {
            next(error);
        }
        },
}
export default taskCollaboratorController;