import { Request, Response, NextFunction } from "express";
import adminClient from "../grpc-client/adminClient";
import { buildMetadata } from "../utils/grpcMetadata";
import logger from "../utils/logger";

const adminController = {
  register: (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;

    adminClient.registerAdmin(data, (err: any, response: any) => {
      if (err) return next(err);

      return res.status(201).json({
        data: response,
        message: "Admin registered successfully",
      });
    });
  },

  login: (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;

    adminClient.loginAdmin(data, (err: any, response: any) => {
      if (err) return next(err);

      return res.status(200).json({
        data: response,
        message: "Admin logged in successfully",
      });
    });
  },

  seeAllUsers: (req: Request, res: Response, next: NextFunction) => {
    const md = buildMetadata(req);

    adminClient.seeAllUsers({}, md, (err: any, response: any) => {
      if (err) return next(err);

      return res.status(200).json({
        data: response,
        message: "Users fetched successfully",
      });
    });
  },

  seeUser: (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.params;
    const md = buildMetadata(req);

    adminClient.seeUser({ user_id }, md, (err: any, response: any) => {
      if (err) return next(err);

      return res.status(200).json({
        data: response,
        message: "User fetched successfully",
      });
    });
  },

  deleteUser: (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.params;
    const md = buildMetadata(req);

    adminClient.deleteUser({ user_id }, md, (err: any, response: any) => {
      if (err) return next(err);

      return res.status(200).json({
        data: response,
        message: "User deleted successfully",
      });
    });
  },

  updateUser: (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.params;
    const { name, email, role } = req.body;
    const md = buildMetadata(req);

    adminClient.updateUser(
      { user_id, name, email, role },
      md,
      (err: any, response: any) => {
        if (err) return next(err);

        return res.status(200).json({
          data: response,
          message: "User updated successfully",
        });
      },
    );
  },


  createTaskForUser: (req: Request,res: Response,next: NextFunction) => {
    console.log("1. Admin task controller reached");
    const data = req.body;
    const md = buildMetadata(req);
      console.log("2. Calling createTaskForUser RPC");
    adminClient.createTaskForUser(data, md, (err: any, response: any) => {
      console.log("3. RPC callback reached");
      if (err){ 
        console.error("RPC error:", err);
        return next(err);
        }
        console.log("RPC response:", response);
      return res.status(201).json({
        data: response,
        message: "Task created successfully for user",
      });
    });
  },


seeAdminTasks: (req: Request, res: Response, next: NextFunction) => {
    const md = buildMetadata(req);
    adminClient.seeAdminTasks({}, md, (err: any, response: any) => {
      if (err) return next(err);

      return res.status(200).json({
        data: response,
        message: "Admin tasks fetched successfully",
      });
    });
  },
};

export default adminController;
