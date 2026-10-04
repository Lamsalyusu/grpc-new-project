import { Request, Response, NextFunction } from "express";
import { requestType } from "../validators/collaborationReqvalidation";
import { buildMetadata } from "../utils/grpcMetadata";
import collaborationClient from "../grpc-client/collaborationClient";

const collaborationController = {
  sendReq: async (req: Request, res: Response, next: NextFunction) => {
    const { receiver_email } = req.body as requestType;
    const md = buildMetadata(req);
    collaborationClient.sendRequest(
      { receiver_email },
      md,
      (err: any, response: any) => {
        if (err) {
          return next(err);
        }
        return res
          .status(201)
          .json({ data: response, message: "request sent successfully" });
      },
    );
  },

  seeReq: async (req: Request, res: Response, next: NextFunction) => {
    // const {receiver_id} = req.body as RequestType;
    const md = buildMetadata(req);
    collaborationClient.seeRequest({}, md, (err: any, response: any) => {
      if (err) {
        return next(err);
      }
      return res
        .status(200)
        .json({ data: response, message: "request viewed" });
    });
  },

  acceptReq: async (req: Request, res: Response, next: NextFunction) => {
    // const {receiver_id} = req.body as RequestType;
    const { id } = req.params;
    const md = buildMetadata(req);
    collaborationClient.acceptRequest({ id }, md, (err: any, response: any) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({
        data: response,
        message: "request accepted",
      });
    });
  },

  rejectReq: async (req: Request, res: Response, next: NextFunction) => {
    // const {receiver_id} = req.body as RequestType;
    const { id } = req.params;
    const md = buildMetadata(req);
    collaborationClient.rejectRequest({ id }, md, (err: any, response: any) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({
        data: response,
        message: "request rejected",
      });
    });
  },

  viewCollaborators: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    // const {id} = req.params;
    const md = buildMetadata(req);
    collaborationClient.viewCollaborators({}, md, (err: any, response: any) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({
        data: response,
        message: "viewed collaborators succkessfully",
      });
    });
  },

  deleteCol: async (req: Request, res: Response, next: NextFunction) => {
    const { targetUserId } = req.params;
    const md = buildMetadata(req);
    collaborationClient.removeCollaborators(
      { targetUserId },
      md,
      (err: any, response: any) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json({
          data: response,
          message: "collaborator deleted successfully",
        });
      },
    );
  },
};
export default collaborationController;
