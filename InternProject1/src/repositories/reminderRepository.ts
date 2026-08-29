import { Op } from "sequelize";
import Task from "../models/taskModel";

async function findDueReminders() {
        const now = new Date();
        const reminders = await Task.findAll({
            where: {
                reminder_at: {
                    //op bhaneko operator ho yesma 
                    //ne bhaneko not equal ho
                    //lte bhaneko less than or equal ho
                    //yesle chai reminder at sanga ko actual date ra ahileko date compare garchha
                    [Op.ne]:null,
                    [Op.lte]: now,
                },
                reminder_status: 'pending',
            },
        });
        return reminders;
}

async function markReminderAsSent(task_id: string) {
        const taskInstance = await Task.findByPk(task_id);
        if (!taskInstance) {
            throw new Error("Task not found");
        }
        taskInstance.reminder_status = 'sent';
        await taskInstance.save();
        return taskInstance;
    
}
export {findDueReminders, markReminderAsSent};