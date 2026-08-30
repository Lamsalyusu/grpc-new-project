import grpc from '@grpc/grpc-js';
import { sendMessage, getMessage } from '../../service/messageService';

function getUserFromCall(call: any) {
  const raw = call.metadata.get('user')[0] as string;   // ← "user", not "decodedToken"
  return JSON.parse(raw);
}

const messageHandlers = {
  SendMessage: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      // const { task_id, body, sender_id } = call.request;
      const {task_id,body} = call.request;
      const message = await sendMessage(task_id, user.id, body);
      callback(null, { message });
    } catch (err: any) {
      callback(
        { 
            code: grpc.status.INTERNAL, 
            message: err.message || "Internal server error"

        });
    }
  },

  GetMessages: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call)
      // const { task_id, page, limit, requester_id } = call.request;
      const { task_id, page,limit} = call.request;
      // const result = await getMessage(task_id, requester_id, page, limit);
      const result = await getMessage(task_id, user.id, page, limit);
      callback(null, { count: result.count, messages: result.rows });
    } catch (err: any) {
      callback(
        { 
        code: grpc.status.INTERNAL, 
        message: err.message || "Internal server error" 
    });
    }
  },
};

export default messageHandlers;