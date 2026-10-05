import {sendRequest,acceptReq,rejectReq,viewRequest,deleteCollaborator,viewCollaborationRequest} from "../service/collaborationService";
import * as grpc from "@grpc/grpc-js";
import getUserFromCall from "../utils/getUser";

const collaboration_handler = {
  sendRequest: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      const sender_id = user.id;
      // const {receiver_id} = call.request;
      const { receiver_email } = call.request;
      // const request = await sendRequest(sender_id,{receiver_id})
      const request = await sendRequest(sender_id, { receiver_email });
      callback(null, request);
    } catch (err: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "couldnot sent request",
      });
    }
  },
  seeRequest: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      // const sender_id = user.id;
      const receiver_id = user.id;
      // const {receiver_id} = call.request;
      const request = await viewRequest(receiver_id);
      callback(null, { reqs: request });
    } catch (err: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "couldnot view request",
      });
    }
  },
  acceptRequest: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      const receiver_id = user.id;
      const { id } = call.request;
      const request = await acceptReq(id, receiver_id);
      callback(null, {
        accept: [request],
      });
    } catch (err: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "couldnot view request",
      });
    }
  },
  rejectRequest: async (call: any, callback: any) => {
    const user = getUserFromCall(call);
    try {
      // const sender_id = user.id;
      // const {receiver_id} = call.request;
      const receiver_id = user.id;
      const { id } = call.request;
      const request = await rejectReq(id, receiver_id);
      callback(null, {
        reject: [request],
      });
    } catch (err: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "couldnot view request",
      });
    }
  },

  viewCollaborators: async (call: any, callback: any) => {
    const user = getUserFromCall(call);
    const currentuser = user.id;
    try {
      const result = await viewCollaborationRequest(currentuser);
      callback(null, {
        collaborators: result,
      });
    } catch (err: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "couldnot view request",
      });
    }
  },

  removeCollaborators: async (call: any, callback: any) => {
    const user = getUserFromCall(call);
    try {
      const currentUserId = user.id;
      const { targetUserId } = call.request;
      const result = await deleteCollaborator(currentUserId, targetUserId);
      callback(null, result);
    } catch (err: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || "couldnot delete collaborators",
      });
    }
  },
};
export default collaboration_handler;
