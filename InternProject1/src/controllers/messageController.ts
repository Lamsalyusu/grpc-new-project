import { Request,Response,NextFunction } from "express";
import { getMessage ,sendMessage} from "../services/messageService";
import { MessageValidation } from "../validators/messageValidators";
const messageControllers = {
    get:async(req:Request,res:Response,next:NextFunction) => {
        try{
            const task_id = req.params.id as string;
            const reqid = (req as any).user.id;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const result = await getMessage(task_id,reqid,page,limit);
            return res.status(200).json({data:result,message:'message retrived successfully'});
        }
        catch(error:any){
        next(error);
    }
    },

    send:async(req:Request,res:Response,next:NextFunction)=>{
        try{

            const {body} = req.body as MessageValidation;
            const senderid = (req as any).user.id;
            const task_id = req.params.id as string;
            const result = await sendMessage(task_id,senderid,body);
            return res.status(201).json({data:result,message:'message send successfully'})

        }
        catch(error:any){
            next(error);
        }
    }
}
export default messageControllers;