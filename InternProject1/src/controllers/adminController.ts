import { Request, Response, NextFunction } from "express";
import adminClient from "../grpc-client/adminClient";
import { buildMetadata } from "../utils/grpcMetadata";
import logger from "../utils/logger";

const adminController = {
  register: (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    logger.info("Admin registration request received");

    adminClient.registerAdmin(data, (err: any, response: any) => {
      if (err) return next(err);

      logger.info("Admin registration successful");
      return res.status(201).json({
        data: response,
        message: "Admin registered successfully",
      });
    });
  },

  login: (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    logger.info("Admin login request received");

    adminClient.loginAdmin(data, (err: any, response: any) => {
      if (err) return next(err);

      logger.info("Admin login successful");
      return res.status(200).json({
        data: response,
        message: "Admin logged in successfully",
      });
    });
  },

  seeAllUsers: (req: Request, res: Response, next: NextFunction) => {
    const md = buildMetadata(req);
    logger.info("Admin fetch-all-users request received");

    adminClient.seeAllUsers({}, md, (err: any, response: any) => {
      if (err) return next(err);

      logger.info("Users fetched successfully for admin");
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
    logger.warn({ message: "Admin delete-user request", userId: user_id });

    adminClient.deleteUser({ user_id }, md, (err: any, response: any) => {
      if (err) return next(err);

      logger.info({ message: "Admin deleted user", userId: user_id });
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

        logger.info({ message: "Admin updated user", userId: user_id });
        return res.status(200).json({
          data: response,
          message: "User updated successfully",
        });
      },
    );
  },

  createTaskForUser: (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const md = buildMetadata(req);
    logger.info("Admin create-task request received");

    adminClient.createTaskForUser(data, md, (err: any, response: any) => {
      if (err) {
        logger.error({ message: "Admin task creation failed", error: err?.message || err });
        return next(err);
      }

      logger.info({ message: "Admin created task", taskId: response?.id || null });
      return res.status(201).json({
        data: response,
        message: "Task created successfully for user",
      });
    });
  },

  seeAdminTasks: (req: Request, res: Response, next: NextFunction) => {
    const md = buildMetadata(req);
    logger.info("Admin fetch tasks request received");

    adminClient.seeAdminTasks({}, md, (err: any, response: any) => {
      if (err) return next(err);

      logger.info("Admin tasks fetched successfully");
      return res.status(200).json({
        data: response,
        message: "Admin tasks fetched successfully",
      });
    });
  },
};

export default adminController;
