//chat handling garda express ko req ,res, next function use nagarne

import { Namespace,Socket } from "socket.io";
import { sendMessage } from "../services/messageService";
import { messageValidationSchema } from "../validators/messageValidators";
import { checkAccess } from "../services/messageService";

function registerChatHandler(io:Namespace,socket:Socket){
    socket.on('join_task',async(data)=>{
        const userid = socket.data.user.id;
        const taskid = data.task_id;
        try{
            //join garna milxa ki nai bhanera check just 
        const hasaccess = await checkAccess(taskid,userid);
        if(!hasaccess){
            socket.emit('error',{message:"cannot join the task"});
            return;
        }
        //tyo chat ma join bhayo user 
        socket.join(`task:${taskid}`);
        socket.emit('joined_task',{task_id:taskid,message:'chat joined successfully'})
        }
        catch(error:any){
            socket.emit('error',{message:error.message || 'Failed to joined the Task'})
        }
    });

    socket.on('send_message',async(data)=>{
        const taskid = data.task_id;
        const userid = socket.data.user.id;
        try{
        //yesma chai user bata aako message ko validation gareko (safe parse use gareko) jun data bata message ko body aauxa tei lai msg linxa 
        const parsed = messageValidationSchema.safeParse({ body: data.body });
        if (!parsed.success) {
        socket.emit('error', { message: 'Invalid message format'});
        return;
        }
        const { body } = parsed.data;
        const result = await sendMessage(taskid,userid,body);
        //yo task id ma msg pathaune 
        io.to(`task:${taskid}`).emit('receive_message',result);

    }
    catch(error:any)
    {
        socket.emit('error',{message:error.message || 'failed to send the message'});
    }
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