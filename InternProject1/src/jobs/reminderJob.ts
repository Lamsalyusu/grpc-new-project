import cron from 'node-cron';
import reminderClient from '../grpc-client/reminderClient';
import logger from '../utils/logger';

async function reminderJob() {
  cron.schedule('*/10 * * * * *', async () => {
    reminderClient.checkDueReminders({},(err: any) => {
      if (err) {
        logger.error({ message: "Reminder job failed", error: err });
        return;
      }
    });
  });
}
export default reminderJob;