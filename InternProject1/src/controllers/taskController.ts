import { Taskrequire } from "../validators/taskValidator";
import taskClient from "../grpc-client/taskClient";
import { NextFunction, Request, Response } from "express";
import { buildMetadata } from "../utils/grpcMetadata";
import logger from "../utils/logger";
// import { grpcStatusCode } from "../utils/statuscode";

const taskControllers = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    const createData = req.body as Taskrequire;
    const owner_id = (req as any).user.id;
    const md = buildMetadata(req);
    taskClient.createTask(
      { ...createData, owner_id },
      md,
      (err: any, result: any) => {
        if (err) {
          return next(err);
        }
        logger.info("created task successfully");
        return res
          .status(201)
          .json({ data: result, message: "task created successfully" });
      },
    );
  },

  getone: async (req: Request, res: Response, next: NextFunction) => {
    const taskid = req.params.id as string;
    const userid = (req as any).user.id;
    const md = buildMetadata(req);
    taskClient.getOne(
      { id: taskid, user_id: userid },
      md,
      (err: any, result: any) => {
        if (err) {
          return next(err);
        }
        logger.info("task retrieved successfully");
        return res
          .status(200)
          .json({ data: result, message: "task retrieved successfully" });
      },
    );
  },

  getAll: async (req: Request, res: Response, next: NextFunction) => {
    const query = (req as any).validatedQuery;
    const userid = (req as any).user.id;
    const md = buildMetadata(req);
    taskClient.getAllTask(
      {
        owner_id: userid,
        status: query.status,
        priority: query.priority,
        page: query.page,
        limit: query.limit,
        sort_by: query.sort_by,
        order: query.order,
      },
      md,
      (err: any, result: any) => {
        if (err) {
          return next(err);
        }
        logger.info("retrieved all tasks successfully");
        return res
          .status(200)
          .json({ data: result, message: "retrieved all tasks" });
      },
    );
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const taskid = req.params.id as string;
    const userid = (req as any).user.id;
    const md = buildMetadata(req);
    taskClient.updateTask(
      { id: taskid, user_id: userid, ...data },
      md,
      (err: any, result: any) => {
        if (err) {
          return next(err);
        }
        logger.info("task updated successfully");
        return res
          .status(200)
          .json({ data: result, message: "task updated successfully" });
      },
    );
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    const taskid = req.params.id as string;
    const userid = (req as any).user.id;
    const md = buildMetadata(req);
    taskClient.removeTask(
      { id: taskid, user_id: userid },
      md,
      (err: any, result: any) => {
        if (err) {
          return next(err);
        }
        logger.info("task removed successfully");
        return res
          .status(200)
          .json({ data: result, message: "task deleted successfully" });
      },
    );
  },
};
export default taskControllers;
