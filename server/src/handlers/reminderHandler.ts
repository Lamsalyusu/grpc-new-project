import * as  grpc from '@grpc/grpc-js';
import processReminder from '../service/reminderService';
import logger from '../utils/logger';

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
      logger.info("checking due reminders")
      callback(null, { reminders });
    } catch (err: any) {
      logger.error(`finding due remiders failed ${err.message}`)
      callback({ code: grpc.status.INTERNAL, 
                  message: err.message || 'Check reminders failed' });
    }
  },
};

export default reminderHandlers;