import { Request,Response,NextFunction } from "express";
import authMiddleware from "./authmiddleware";

function adminAuthMiddleware(req:Request,res:Response,next:NextFunction){
    authMiddleware(req,res, ()=>{
        const user = (req as any).user;
        console.log("Gateway authenticated role:", user?.role);
        if(user.role !== "admin"){
            return res.status(403).json({
                error:{"message":"Admin access required"},
            })
        }
        next();
    })
}
export default adminAuthMiddleware;