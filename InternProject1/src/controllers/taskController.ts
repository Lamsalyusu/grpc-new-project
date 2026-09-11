import { Taskrequire} from "../validators/taskValidator";
import TaskClient from '../grpc-client/taskClient'
import { Request, Response } from "express";
import { buildMetadata } from "./grpcMetadata";

const taskControllers = {
  create: async (req: Request, res: Response) => {
    const crtdata = req.body as Taskrequire;
    const owner_id = (req as any).user.id;
    const md = buildMetadata(req);
    TaskClient.CreateTask({ ...crtdata, owner_id }, md,(err: any, result: any) => {
      if (err) return res.status(err.code === 409 ? 409 : 500).json({ error: { message: err.message || "task creation failed" } });
      return res.status(201).json({ data: result, message: 'task created successfully' });
    });
  },

  getone: async (req: Request, res: Response) => {
    const taskid = req.params.id as string;
    const userid = (req as any).user.id;
    const md = buildMetadata(req);
    TaskClient.GetOne({ id: taskid, user_id: userid }, md, (err: any, result: any) => {
      if (err) return res.status(err.code === 404 ? 404 : 500).json({ error: { message: err.message || "task retrieval failed" } });
      return res.status(200).json({ data: result, message: 'task retrieved successfully' });
    });
  },

  getAll: async (req: Request, res: Response) => {
    const query = (req as any).validatedQuery;
    const userid = (req as any).user.id;
    const md = buildMetadata(req);
    TaskClient.GetAllTask(
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
        if (err) return res.status(500).json({ error: { code: err.code, message: err.message || "task retrieval failed" } });
        return res.status(200).json({ data: result, message: "retrieved all tasks" });
      }
    );
  },

  update: async (req: Request, res: Response) => {
    const data = req.body;
    const taskid = req.params.id as string;
    const userid = (req as any).user.id;
    const md = buildMetadata(req);
    TaskClient.Update({ id: taskid, user_id: userid, ...data }, md, (err: any, result: any) => {
      if (err) return res.status(err.code === 404 ? 404 : 500).json({ error: { message: err.message || "task update failed" } });
      return res.status(200).json({ data: result, message: 'task updated successfully' });
    });
  },

  remove: async (req: Request, res: Response) => {
    const taskid = req.params.id as string;
    const userid = (req as any).user.id;
    const md = buildMetadata(req);
    TaskClient.Remove({ id: taskid, user_id: userid }, md, (err: any, result: any) => {
      if (err) return res.status(err.code === 404 ? 404 : 500).json({ error: { message: err.message || "task deletion failed" } });
      return res.status(200).json({ data: result, message: 'task deleted successfully' });
    });
  },
}

export default taskControllers;