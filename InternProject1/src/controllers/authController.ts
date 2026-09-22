import { Request, Response, NextFunction } from "express";
import AuthClient from "../grpc-client/authClient";
import { LoginInput, RegisterInput } from "../validators/authValidator";
import { buildMetadata } from "./grpcMetadata";
import logger from "../utils/logger";


const authController = {
  register: async (req: Request, res: Response,next:NextFunction) => {
    logger.info("register request received")
    // console.log("register controller hit")
    const data = req.body as RegisterInput;
    // console.log(req.body)
    // console.log(data);
    AuthClient.Register(data, (err: any, response: any) => {
      if (err) {
        // return res.status(err.code === grpc.status.ALREADY_EXISTS ? 409 : 500).json({
        //   error: { message: err.message || "Registration failed" },
        // });
        // const errorInfo = grpcStatusCode(err.code);
        // return res.status(errorInfo.status).json({
        //   message:err.details || errorInfo.message
        // });
        return next(err);
      }
      logger.info("registration successful")
      return res.status(201).json({ data: response, message: 'Registered successfully' });
    });
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    logger.info('login request received')
  
    const data = req.body as LoginInput;
    // console.log(req.params)
    // console.log(data)
    // console.log(req.body)
    // console.log(res)
    AuthClient.Login(data, (err: any, response: any) => {
      if (err) {
        // return res.status(err.code === grpc.status.UNAUTHENTICATED ? 401 : 500).json({
        //   error: { message: err.message || "Login failed" },
        // });
        // const errorInfo = grpcStatusCode(err.code);
        // return res.status(errorInfo.status).json({
        //   message:err.details || errorInfo.message
        // });

      return next(err);
      }
      logger.info("login successful")
      return res.status(200).json({ data: response, message: 'Logged in successfully' });
    });
  },

  me:async (req: Request, res: Response, next: NextFunction) => {
    logger.info('fetch profile request received')
    const user_id = (req as any).user.id;
    // console.log(req)
    const md = buildMetadata(req);
    // console.log(user_id)
    // console.log(md)
    // console.log(res);
    AuthClient.Me({ user_id }, md, (err: any, response: any) => {
      if (err) {
        // return res.status(err.code === grpc.status.NOT_FOUND ? 404 : 500).json({
        //   error: { message: err.message || "Fetching user info failed" },
        // });
        // const errorInfo = grpcStatusCode(err.code);
        // return res.status(errorInfo.status).json({
        //   message:err.details || errorInfo.message
        // });
        next(err);
      }
      logger.info("profile fetched successfully")
      return res.status(200).json({ data: response, message: 'User info fetched successfully' });
    });
    
    // console.log(user_id)
  }
};

export default authController;