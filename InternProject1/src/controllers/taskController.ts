import {Taskrequire,taskqueryschema} from "../validators/taskValidator";
import {createTask,deleteTask,getTaskById,getTasksByOwner,updateTask} from '../services/taskService';
import { Request,Response,NextFunction } from "express";


const taskControllers = {
    create:async(req:Request,res:Response,next:NextFunction) =>{
        try{
            const crtdata = req.body as Taskrequire;
            const owner_id = (req as any).user.id;
            const result = await createTask(crtdata,owner_id);
            return res.status(201).json({data:result,message:'task created successfully'});

        }
        catch(error:any){
            // return res.status(error.status || 500).json({ error: { message: error.message || "something went wrong" } });
            next(error);
        }
    },
    getone:async(req:Request,res:Response,next:NextFunction)=>{
        try{
            const taskid = req.params.id as string;
            const userid = (req as any).user.id;
            const result = await getTaskById(taskid,userid)
            return res.status(200).json({data:result,message:'task retrieved successfully'});
        }
        catch(error:any){
            // return res.status(error.status || 500).json({ error: { message: error.message || "something went wrong" } });
            next(error);
        }
    },
    getAll:async(req:Request,res:Response,next:NextFunction)=>{
        try{
            // const query = req.query as unknown as taskqueryschema;
            const query = (req as any).validatedQuery;
            const userid = (req as any).user.id;
            const result = await getTasksByOwner(userid,query);
            return res.status(200).json({data:result,message:'retrived all tasks'});
        }
        catch(error:any){
            // return res.status(error.status || 500).json({ error: { message: error.message || 'something went wrong' } });
            next(error);
        }
    },
    update:async(req:Request,res:Response,next:NextFunction) =>{
        try{
            const data = req.body;
            const taskid = req.params.id as string;
            const userid = (req as any).user.id;
            const result = await updateTask(data,userid,taskid);
            return res.status(200).json({data:result,message:'task updated successfully'});

        }catch(error:any){
            // return res.status(error.status || 500).json({ error: { message: error.message || "something went wrong" } });
            next(error);
        }
    },
    remove:async(req:Request,res:Response,next:NextFunction) => {
        try{
        const taskid = req.params.id as string;
        const userid = (req as any).user.id;
        const result = await deleteTask(taskid,userid);
        return res.status(200).json({data:result,message:'task deleted successfully'});
        }
        catch(error:any){
            // return res.status(error.status || 500).json({ error: { message: error.message || "something went wrong" } });
            next(error);
        }
    }
}

export default taskControllers;