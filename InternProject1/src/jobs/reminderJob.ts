import cron from 'node-cron';
import reminderclient from '../grpc-client/reminderClient';

async function reminderJob() {
  cron.schedule('*/10 * * * * *', async () => {

    reminderclient.CheckDueReminders({},(err: any, result: any) => {
      if (err) {
        console.error("Error in reminder job", err);
        return;
      }
    });
  });
}
export default reminderJob;