import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import {initSocket} from './sockets/index';
import { createServer } from 'node:http';
import reminderJob from './jobs/reminderJob';

const httpServer = createServer(app);
initSocket(httpServer);
reminderJob();


const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
httpServer.listen(Number(PORT),HOST, () => {
 console.log(`Server running on http://${HOST}:${PORT}`);
});
