import { Request, Response, NextFunction } from "express";
import * as grpc from '@grpc/grpc-js';
// import AuthClient from "../grpc-client/authClient";
import AuthClient from "../grpc-client/authClient";
import { LoginInput, RegisterInput } from "../validators/authValidator";
import { buildMetadata } from "./grpcMetadata";

const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as RegisterInput;

    AuthClient.Register(data, (err: any, response: any) => {
      if (err) {
        return res.status(err.code === grpc.status.ALREADY_EXISTS ? 409 : 500).json({
          error: { message: err.message || "Registration failed" },
        });
      }
      return res.status(201).json({ data: response, message: 'Registered successfully' });
    });
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as LoginInput;

    AuthClient.Login(data, (err: any, response: any) => {
      if (err) {
        return res.status(err.code === grpc.status.UNAUTHENTICATED ? 401 : 500).json({
          error: { message: err.message || "Login failed" },
        });
      }
      return res.status(200).json({ data: response, message: 'Logged in successfully' });
    });
  },

  me:async (req: Request, res: Response, next: NextFunction) => {
    const user_id = (req as any).user.id;
    const md = buildMetadata(req);
    AuthClient.Me({ user_id }, md, (err: any, response: any) => {
      if (err) {
        return res.status(err.code === grpc.status.NOT_FOUND ? 404 : 500).json({
          error: { message: err.message || "Fetching user info failed" },
        });
      }
      return res.status(200).json({ data: response, message: 'User info fetched successfully' });
    });
  }
};

export default authController;