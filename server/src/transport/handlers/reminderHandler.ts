import grpc from '@grpc/grpc-js';
import processReminder from '../../service/reminderService';

const reminderHandlers = {
  CheckDueReminders: async (call: any, callback: any) => {
    try {
      const fired = await processReminder();
      const reminders = fired.map((f: any) => ({
        owner_id: f.owner_id,
        task_id: f.payload.task_id,
        title: f.payload.title,
        description: f.payload.description,
        due_date: f.payload.due_date,
      }));
      callback(null, { reminders });
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: err.message || 'Check reminders failed' });
    }
  },
};

export default reminderHandlers;