import cron from 'node-cron';
import reminderClient from '../grpc-client/reminderClient';

async function reminderJob() {
  cron.schedule('*/10 * * * * *', async () => {
    reminderClient.checkDueReminders({},(err: any) => {
      if (err) {
        console.error("Error in reminder job", err);
        return;
      }
    });
  });
}
export default reminderJob;