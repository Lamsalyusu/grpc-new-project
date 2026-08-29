import cron from 'node-cron';
import processReminder from '../services/reminderService';

async function reminderJob(){
    cron.schedule('*/10 * * * * *',async()=>{
        try{
        await processReminder();
        // console.log("Running reminder job");
        }
        catch(error){
            console.error("Error in reminder job",error);
        }
    });
}
export default reminderJob;