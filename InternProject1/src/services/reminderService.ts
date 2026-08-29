import {findDueReminders,markReminderAsSent} from "../repositories/reminderRepository";
import { findAllByTask } from "../repositories/taskCollaboratorRepository";
import { createNotification } from "../services/notificationService";
import  {getIO}  from '../sockets/index';

async function processReminder(){
    //find due reminder 
    const dueReminders = await findDueReminders();
    if(!dueReminders || dueReminders.length === 0){
        // console.log("No due reminders found");
        return;
    }
    const io = getIO();
    //loop through each reminder
    for(const reminder of dueReminders){
        const payload ={
                task_id:reminder.id,
                title:reminder.title,
                description:reminder.description,
                due_date:reminder.due_date
            }
        //create notification
        await createNotification(
            reminder.owner_id,'reminder',
            payload
        );

        const collaborators = await findAllByTask(reminder.id);
            for (const collab of collaborators) {
            await createNotification(
                collab.user_id,
                'reminder',
                payload
            );
            }
        //emit socket.io event
        // const io = getIO();
        io.to(reminder.owner_id).emit('reminder', 
            payload);
        //mark reminder as sent
        await markReminderAsSent(reminder.id);
    }
    
}
export default processReminder;