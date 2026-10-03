import { Request, Response, NextFunction } from "express";
import authClient from "../grpc-client/authClient";
import { loginInput, registerInput } from "../validators/authValidator";
import { buildMetadata } from "./grpcMetadata";
import logger from "../utils/logger";

const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    logger.info("register request received");
    const data = req.body as registerInput;
    authClient.registerUser(data, (err: any, response: any) => {
      if (err) {
        return next(err);
      }
      logger.info("registration successful");
      return res
        .status(201)
        .json({ data: response, message: "Registered successfully" });
    });
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    logger.info("login request received");

    const data = req.body as loginInput;
    authClient.loginUser(data, (err: any, response: any) => {
      if (err) {
        return next(err);
      }
      logger.info("login successful");
      return res
        .status(200)
        .json({ data: response, message: "Logged in successfully" });
    });
  },

  me: async (req: Request, res: Response, next: NextFunction) => {
    logger.info("fetch profile request received");
    const user_id = (req as any).user.id;
    const md = buildMetadata(req);
    authClient.seeProfile({ user_id }, md, (err: any, response: any) => {
      if (err) {
        next(err);
      }
      logger.info("profile fetched successfully");
      return res
        .status(200)
        .json({ data: response, message: "User info fetched successfully" });
    });
  },
};

export default authController;
