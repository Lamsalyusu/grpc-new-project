// import { NextFunction, Request,Response } from "express"
// import NotificationClient from "../grpc-client/notificationClient";
// import { buildMetadata } from "./grpcMetadata";
// const notificationController = {

//     GetNotifications:async(req:Request,res:Response,next:NextFunction)=>{
//             const {user_id,type,payload} = req.body;
//             const md = buildMetadata(req);
//             NotificationClient.GetNotifications({user_id,type,payload},md,(err:any,result:any)=>{
//                 if(err){
//                     return res.status(err.code === 409 ? 409 : 500).json({error:{message:err.message || "notification creation failed"}});
//                 }
//                 return res.status(201).json({data:result,message:'notification created successfully'});
//             });
//     },

//     MarkAsRead:async(req:Request,res:Response,next:NextFunction)=>{
//             const notification_id = req.params.id as string;
//             // const user_id = (req as any).user.id;

//             const md = buildMetadata(req);
//             NotificationClient.MarkAsRead({id: notification_id},md,(err:any,result:any)=>{
//                 if(err){
//                     return res.status(err.code === 409 ? 409 : 500).json({error:{message:err.message || "notification marking failed"}});
//                 }
//                 return res.status(200).json({data:result,message:'notification marked as read successfully'});
//             });
//     },

//     getByUser:async(req:Request,res:Response,next:NextFunction)=>{
//             const user_id = (req as any).user.id;
//             const page = parseInt(req.query.page as string) || 1;
//             const limit = parseInt(req.query.limit as string) || 10;
//             const unreadOnly = req.query.unreadOnly === 'true';
//             const md = buildMetadata(req);
//             NotificationClient.GetNotificationByUser({user_id,page,limit,unreadOnly},md,(err:any,result:any)=>{
//                 if(err){
//                     return res.status(err.code === 409 ? 409 : 500).json({error:{message:err.message || "notification fetching failed"}});
//                 }
//                 return res.status(200).json({
//                     data:result.rows,
//                     meta:{
//                         page,
//                         limit,
//                         total:result.count
//                     },
//                     message:'notifications fetched successfully'});

//         });
//     },

//     GetUnreadCount:async(req:Request,res:Response,next:NextFunction)=>{
//             const user_id = (req as any).user.id;
//             const md = buildMetadata(req);
//             NotificationClient.GetUnreadCount({user_id},md,(err:any,result:any)=>{
//                 if(err){
//                     return res.status(err.code === 409 ? 409 : 500).json({error:{message:err.message || "unread notifications count fetching failed"}});
//                 }
//                 return res.status(200).json({data:result,message:'unread notifications count fetched successfully'});
//         });

//     }
// }

// export default notificationController;

import { NextFunction, Request, Response } from "express";
import NotificationClient from "../grpc-client/notificationClient";
import { buildMetadata } from "./grpcMetadata";

const notificationController = {
  getByUser: async (req: Request, res: Response, next: NextFunction) => {
    const user_id = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const unread_only = req.query.unreadOnly === "true";
    const md = buildMetadata(req);
    NotificationClient.GetNotificationByUser(
      { user_id, page, limit, unread_only },md,(err: any, result: any) => {
        if (err) {
          return res.status(500).json({error: { message: err.message || "notification fetching failed" },
        });
      }
      return res.status(200).json({ data: result.notifications,meta: { page,limit,total: result.count,},message: "notifications fetched successfully",
      });
      },
    );
  },

  MarkAsRead: async (req: Request, res: Response, next: NextFunction) => {
    const notification_id = req.params.id as string;
    const md = buildMetadata(req);
    NotificationClient.MarkAsRead({ id: notification_id,},md,(err: any, result: any) => {
        if (err) { return res.status(500).json({ error: { message: err.message || "notification marking failed",},});
    }
        return res.status(200).json({ data: result, message: "notification marked as read successfully",});
      },
    );
  },

  GetUnreadCount: async (req: Request, res: Response, next: NextFunction) => {
    const user_id = (req as any).user.id;
    const md = buildMetadata(req);
    NotificationClient.GetUnreadCount({user_id,},md,(err: any, result: any) => {
        if (err) {return res.status(500).json({ error: {message:err.message || "unread notifications count fetching failed",},
          });
        }
        return res.status(200).json({ data: result, message: "unread notifications count fetched successfully"});
      },
    );
  },
};
export default notificationController;
