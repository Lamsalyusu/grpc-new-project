import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import {initSocket} from './sockets/index';
import { createServer } from 'node:http';
import reminderJob from './jobs/reminderJob';
import logger from './utils/logger';

const httpServer = createServer(app);
initSocket(httpServer);
reminderJob();


const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
httpServer.listen(Number(PORT),HOST, () => {
    logger.info(`Server running on http://${HOST}:${PORT}`)
 console.log(`Server running on http://${HOST}:${PORT}`);
});
