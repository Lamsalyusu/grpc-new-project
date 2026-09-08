//chat handling garda express ko req ,res, next function use nagarne

import { Namespace,Socket } from "socket.io";
import MessageClient from "../grpc-client/messageClient";
import { messageValidationSchema } from "../validators/messageValidators";
import * as grpc from '@grpc/grpc-js';

function buildSocketMetadata(socket: Socket): grpc.Metadata {
  const md = new grpc.Metadata();
  const token = socket.data.token; 
  if (token) {
    md.set('authorization', `Bearer ${token}`);
  }
  return md;
}


function registerChatHandler(io: Namespace, socket: Socket) {
  socket.on('join_task', (data) => {
    const taskid = data.task_id;
    const md = buildSocketMetadata(socket);

    MessageClient.checkAccess({ task_id: taskid }, md, (err: any, result: any) => {
      if (err || !result?.has_access) {
        socket.emit('error', { message: err?.message || "cannot join the task" });
        return;
      }
      socket.join(`task:${taskid}`);
      socket.emit('joined_task', { task_id: taskid, message: 'chat joined successfully' });
    });
  });

    socket.on('send_message',async(data)=>{
        const taskid = data.task_id;
        // const userid = socket.data.user.id;
        //yesma chai user bata aako message ko validation gareko (safe parse use gareko) jun data bata message ko body aauxa tei lai msg linxa 
        const parsed = messageValidationSchema.safeParse({ body: data.body });
        if (!parsed.success) {
        socket.emit('error', { message: 'Invalid message format'});
        return;
        }
        const { body } = parsed.data;
        const md = buildSocketMetadata(socket);
        MessageClient.SendMessage({task_id:taskid,body},md, (err: any, result: any) => {
            if (err) {
                socket.emit('error', { message: err.message || 'Failed to send the message' });
                return;
            }
            //yo task id ma msg pathaune 
            io.to(`task:${taskid}`).emit('receive_message', result.message);
        });
    });

    socket.on('leave_task',(data)=>{
        // yo chai yeuta specific task bata leave bhako 
        const taskid = data.task_id;
        //yo .rooms.has(taskid) bhanekoo chai tyo user kunai euta specific room ma connected chha ki nai bhanera patta lagaune ho
        if (!socket.rooms.has(`task:${taskid}`)) {
            socket.emit('error', { message: 'not a part of this chat' });
            return;
        }
        socket.leave(`task:${taskid}`);
        socket.emit('left_task', { task_id: taskid, message: 'Left the task chat successfully' });
    });
}

export default registerChatHandler;