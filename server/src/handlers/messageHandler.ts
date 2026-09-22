import * as grpc from '@grpc/grpc-js';
import { sendMessage, getMessage,checkAccess } from '../service/messageService';
import logger from '../utils/logger';

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
      logger.warn("sent message failed")
      return callback({ code: grpc.status.INTERNAL, message: "message creation failed" });
    }
    logger.info("message sent successfully")
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
    logger.error(`Couldnot sent message: ${err.message}`);
    callback({ 
      code: grpc.status.INTERNAL, 
      message: err.message || "Internal server error" });
  }
},

GetMessage: async (call: any, callback: any) => {
  try {
    const user = getUserFromCall(call);
    const { task_id, page, limit } = call.request;
    const result = await getMessage(task_id, user.id, page, limit);
    if(!result){
      logger.warn("get message failed")
      return callback({ code: grpc.status.INTERNAL, message: "message loading failed" });
    }
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
    // console.log("helloooooooooooo")
  } catch (err: any) {
    logger.warn(`get message failed ${err.message}`)
    callback({ 
      code: grpc.status.INTERNAL,
       message: err.message || "Internal server error" });
  }
},

  checkAccess:async(call:any,callback:any) => {
    try{
      const user = getUserFromCall(call);
      const {task_id} = call.request;
      const hasAccess = await checkAccess(task_id,user.id);
      logger.info("check access granted")
      callback(null,{has_access:hasAccess});
    } catch(err:any){
      logger.error(`check access failed: ${err.message}`)
      callback(
        { 
        code: grpc.status.INTERNAL, 
        message: err.message || "Internal server error" 
    });
    }
  }
};

export default messageHandlers;