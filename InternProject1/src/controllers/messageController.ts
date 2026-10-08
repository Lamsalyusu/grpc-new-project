import { Request, Response, NextFunction } from "express";
import messageClient from "../grpc-client/messageClient";
import { messageValidation } from "../validators/messageValidators";
import { buildMetadata } from "../utils/grpcMetadata";
import logger from "../utils/logger";

const messageControllers = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    const task_id = req.params.id as string;
    // const reqid = (req as any).user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const md = buildMetadata(req);
    messageClient.getMessage(
      { task_id: task_id, page: page, limit: limit },
      md,
      (error: any, result: any) => {
        if (error) {
          return next(error);
        }
        logger.info("message loaded successfully");
        return res
          .status(200)
          .json({ data: result, message: "message retrived successfully" });
      },
    );
  },

  send: async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req.body as messageValidation;
    // const senderid = (req as any).user.id;
    const task_id = req.params.id as string;
    const image = (req as any).file
    console.log("IMage ko request hereko la guyz haru maile ",image);
    const md = buildMetadata(req);
    messageClient.sendMessage(
      { task_id,
        body,
        image:image?image.buffer:Buffer.alloc(0) 
      },
      md,
      (error: any, result: any) => {
        if (error) {
          return next(error);
        }
        logger.info("message sent successfully");
        return res
          .status(201)
          .json({ data: result, message: "message send successfully" });
      },
    );
  },
};
export default messageControllers;
