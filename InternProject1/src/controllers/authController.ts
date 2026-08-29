// import { findById } from "../repositories/userRepository";
// import { LoginInput, RegisterInput} from "../validators/authValidator";
// import { registerUser,loginUser } from "../services/authService";
// import { NextFunction, Request,Response } from "express";

// const authController = {
//     register: async(req:Request,res:Response,next:NextFunction) =>{
//         try{
//             const data = req.body as RegisterInput;
//             const result = await registerUser(data);
//             return res.status(201).json({message:'registered successfully',data:result});
//         }
//         catch(error:any){
//             // return res.status(error.status || 500).json({error:{message:error.message || "Something went wrong"}});
//             next(error);
//         }

//     },

//     login:async(req:Request,res:Response,next:NextFunction)=>{
//         try{
//             const data = req.body as LoginInput;
//             const result = await loginUser(data);
//             return res.status(200).json({message:'logged in successfully',data:result})
//         }
//         catch(error:any){
//             // return res.status(error.status ||500).json({error:{message:error.message || "Something went wrong"}});
//             next(error);
//         }
//     },

//     me: async (req: Request, res: Response,next:NextFunction) => {
//     try {
//       const userId = (req as any).user.id;
//       const user = await findById(userId);

//       if (!user) {
//         return res.status(404).json({ error: { message: "User not found" } });
//       }
//       return res.status(200).json({
//         data: { id: user.id, name: user.name, email: user.email, role: user.role },
//       });

//         } catch (error: any) {
//             // return res.status(500).json({ error: { message: error.message || "something went wrong"} });
//             next(error);
//         }
//   },

// };
// export default authController;


import { Request, Response, NextFunction } from "express";
import * as grpc from '@grpc/grpc-js';
// import AuthClient from "../grpc-client/authClient";
import AuthClient from "../grpc-client/authClient";
import { LoginInput, RegisterInput } from "../validators/authValidator";

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
};

export default authController;