import { Request, Response, NextFunction } from "express";
import { taskcollaboratorvalidation } from "../validators/taskCollaboratorValidator";
import taskCollaboratorClient from "../grpc-client/taskCollaboratorClient";
import { buildMetadata } from "./grpcMetadata";
import logger from "../utils/logger";

const taskCollaboratorController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    // suruma maile yeta email rakheko the because earlier maile collaborators chai through email add garirako thiye
    // suruma maile yeta email rakheko the because earlier maile collaborators chai through email add garirako thiye
    // but now i am adding the collaborators through id thats why i am using user_id
    const { user_id } = req.body as taskcollaboratorvalidation;
    //task id chai parameter bata aauxa hai
    const task_id = req.params.id as string;
    //reqid chai new add garne collaborator ko id ho
    const reqid = (req as any).user.id;
    const md = buildMetadata(req);
    taskCollaboratorClient.createCollaborator(
      { task_id, reqid, user_id },
      md,
      (err: any, result: any) => {
        if (err) {
          return next(err);
        }
        logger.info("Task collaborator added in the task");
        return res
          .status(201)
          .json({ data: result, message: "collaborator added successfully" });
      },
    );
  },

  getCollaborator: async (req: Request, res: Response, next: NextFunction) => {
    //task id chai parameter bata aauxa hai
    const task_id = req.params.id as string;
    //reqid chai new add garne collaborator ko id ho
    const reqid = (req as any).user.id;
    const md = buildMetadata(req);
    taskCollaboratorClient.getCollaborators(
      { task_id, reqid },
      md,
      (err: any, result: any) => {
        if (err) {
          return next(err);
        }
        logger.info("task collaborator retrieved successfully");
        return res
          .status(200)
          .json({ data: result, message: "fetched collaborator" });
      },
    );
  },

  deleteCollaborators: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    //task id chai parameter bata aauxa hai
    const task_id = req.params.id as string;
    //reqid chai new add garne collaborator ko id ho
    const reqid = (req as any).user.id;
    const md = buildMetadata(req);
    const user_id = req.params.userId as string;
    taskCollaboratorClient.deleteCollaborator(
      { task_id, reqid, user_id },
      md,
      (err: any, result: any) => {
        if (err) {
          return next(err);
        }
        logger.info("task collaborator deleted");
        return res
          .status(200)
          .json({ data: result, message: "deleted collaborator successfully" });
      },
    );
  },

  getSharedTasks: async (req: Request, res: Response, next: NextFunction) => {
    const user_id = (req as any).user.id;
    const md = buildMetadata(req);
    taskCollaboratorClient.getSharedTasks(
      { user_id },
      md,
      (err: any, result: any) => {
        if (err) {
          return next(err);
        }
        logger.info("shared tasks retrieved succesfully");
        return res
          .status(200)
          .json({
            data: result,
            message: "Shared tasks retrieved successfully",
          });
      },
    );
  },
  leaveTask: async (req: Request, res: Response, next: NextFunction) => {
    const task_id = req.params.id as string;
    const user_id = (req as any).user.id;
    const md = buildMetadata(req);
    taskCollaboratorClient.leaveTask(
      { task_id, user_id },
      md,
      (err: any, result: any) => {
        if (err) {
          return next(err);
        }
        logger.info("task left successfully");
        return res
          .status(200)
          .json({ data: result, message: "left the task successfully" });
      },
    );
  },
};
export default taskCollaboratorController;
