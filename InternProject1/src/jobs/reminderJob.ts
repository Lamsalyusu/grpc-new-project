import cron from 'node-cron';
import reminderclient from '../grpc-client/reminderClient';
import * as grpc from '@grpc/grpc-js';

async function reminderJob() {
  cron.schedule('*/10 * * * * *', async () => {
    const md = new grpc.Metadata(); // empty — no token needed, this path is exempted

    reminderclient.CheckDueReminders({}, md, (err: any, result: any) => {
      if (err) {
        console.error("Error in reminder job", err);
        return;
      }
      console.log("Running reminder job, fired reminders:", result.reminders);
    });
  });
}
export default reminderJob;