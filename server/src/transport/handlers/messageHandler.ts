import grpc from '@grpc/grpc-js';
import { sendMessage, getMessage } from '../../service/messageService';


const messageHandlers = {
  SendMessage: async (call: any, callback: any) => {
    try {
      const { task_id, body, sender_id } = call.request;
      const message = await sendMessage(task_id, sender_id, body);
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
      const { task_id, page, limit, requester_id } = call.request;
      const result = await getMessage(task_id, requester_id, page, limit);
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