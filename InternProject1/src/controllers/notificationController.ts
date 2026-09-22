import { NextFunction, Request, Response } from "express";
import NotificationClient from "../grpc-client/notificationClient";
import { buildMetadata } from "./grpcMetadata";
import logger from "../utils/logger";
// import { grpcStatusCode } from "../utils/statuscode";

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
          // return res.status(500).json({error: { message: err.message || "notification fetching failed" },
          // const errorInfo = grpcStatusCode(err.code);
          // return res.status(errorInfo.status).json({
          // message:err.details || errorInfo.message                
        // });
        // });
        return next(err);
    }
    logger.info("notification loaded by user")
      return res.status(200).json({ 
        data: result.notifications,meta: { page,limit,total: result.count,},
        message: "notifications fetched successfully",
      });
    });
},

  MarkAsRead: async (req: Request, res: Response, next: NextFunction) => {
    const notification_id = req.params.id as string;
    const md = buildMetadata(req);
    NotificationClient.MarkAsRead({ id: notification_id,},md,(err: any, result: any) => {
        if (err) { 
          // return res.status(500).json({ error: { message: err.message || "notification marking failed",},});
        //   const errorInfo = grpcStatusCode(err.code);
        //   return res.status(errorInfo.status).json({
        //   message:err.details || errorInfo.message
        // });
        return next(err);
      }
      logger.info("notification marked as read")
        return res.status(200).json({ 
          data: result,
          message: "notification marked as read successfully",
        });
      },
    );
  },

  GetUnreadCount: async (req: Request, res: Response, next: NextFunction) => {
    const user_id = (req as any).user.id;
    const md = buildMetadata(req);
    NotificationClient.GetUnreadCount({user_id,},md,(err: any, result: any) => {
        if (err) {
          // return res.status(500).json({ 
          //   error: {message:err.message || "unread notifications count fetching failed",}
          // });
          // const errorInfo = grpcStatusCode(err.code);
          // return res.status(errorInfo.status).json({
          // message:err.details || errorInfo.message
          // });
          return next(err);
        }
        logger.info("unread notification fetched successfully")
        return res.status(200).json({ 
          data: result, 
          message: "unread notifications count fetched successfully"});
      },
    );
  },
};
export default notificationController;
