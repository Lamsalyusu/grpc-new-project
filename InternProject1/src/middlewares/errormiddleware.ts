// import { Request, Response, NextFunction } from "express";

// function errorHandler(error: any, req: Request, res: Response, _next: NextFunction) {
//   const status = error.status || 500;
//   const message = error.message || "Something went wrong";
//   res.status(status).json({ error: { message } });
// }
// export default errorHandler;

// 
import { Request ,Response,NextFunction} from "express";
import  {grpcStatusCode}  from "../utils/statuscode";

function errorHandler(err:any,_req:Request,res:Response,_next:NextFunction){  
  console.log(err.details ,err.code)
  const errorInfo = grpcStatusCode(err.code);
  console.log(errorInfo)
  return res.status(errorInfo.status).json({
    message: err.details || errorInfo.message
  });
};

export default errorHandler;