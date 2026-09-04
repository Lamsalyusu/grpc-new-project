import grpc from '@grpc/grpc-js';
import { sendMessage, getMessage,checkAccess } from '../../service/messageService';

function getUserFromCall(call: any) {
  const raw = call.metadata.get('user')[0] as string;   // ← "user", not "decodedToken"
  return JSON.parse(raw);
}

const messageHandlers = {
  SendMessage: async (call: any, callback: any) => {
  try {
    const user = getUserFromCall(call);
    const { task_id, body } = call.request;
    const message = await sendMessage(task_id, user.id, body);
    if (!message) {
      return callback({ code: grpc.status.INTERNAL, message: "message creation failed" });
    }
    callback(null, {
      message: {
        id: message.id,
        task_id: message.task_id,
        sender_id: message.sender_id,
        sender_name: message.sender?.name,
        body: message.body,
        created_at: message.created_at,
      }
    });
  } catch (err: any) {
    callback({ code: grpc.status.INTERNAL, message: err.message || "Internal server error" });
  }
},

GetMessage: async (call: any, callback: any) => {
  try {
    const user = getUserFromCall(call);
    const { task_id, page, limit } = call.request;
    const result = await getMessage(task_id, user.id, page, limit);
    callback(null, {
      count: result.count,
      message: result.rows.map((m: any) => ({
        id: m.id,
        task_id: m.task_id,
        sender_id: m.sender_id,
        sender_name: m.sender?.name || m.sender?.email || 'Unknown',
        body: m.body,
        created_at: m.created_at,
      })),
    });
  } catch (err: any) {
    callback({ code: grpc.status.INTERNAL, message: err.message || "Internal server error" });
  }
},

  checkAccess:async(call:any,callback:any) => {
    try{
      const user = getUserFromCall(call);
      const {task_id} = call.request;
      const hasAccess = await checkAccess(task_id,user.id);
      callback(null,{has_access:hasAccess});
    } catch(err:any){
      callback(
        { 
        code: grpc.status.INTERNAL, 
        message: err.message || "Internal server error" 
    });
    }
  }
};

export default messageHandlers;