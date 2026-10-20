import { Request,Response,NextFunction } from "express";
import authMiddleware from "./authmiddleware";
import logger from "../utils/logger";

function adminAuthMiddleware(req:Request,res:Response,next:NextFunction){
    authMiddleware(req,res, ()=>{
        const user = (req as any).user;
        logger.info({ message: "Admin authorization checked", userId: user?.id });
        if(user.role !== "admin"){
            return res.status(403).json({
                error:{"message":"Admin access required"},
            })
        }
        next();
    })
}
export default adminAuthMiddleware;