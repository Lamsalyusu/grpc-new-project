import dotenv from 'dotenv';
dotenv.config();

import authHandlers from "./handlers/authHandler";
import taskHandlers from "./handlers/taskHandler";
import taskCollaboratorHandlers from "./handlers/taskCollaboratorHandler";
import messageHandlers from "./handlers/messageHandler";
import notificationHandlers from "./handlers/notificationHandler";
import reminderHandlers from "./handlers/reminderHandler";
import PROTO_PATHS from "./index";
import authInterceptor from './interceptors/authInterceptors';

import * as grpc from '@grpc/grpc-js'
import * as protoloader from '@grpc/proto-loader';
import sequelize from './db/connection';
import logger from './utils/logger';
import collaboration_handler from './handlers/collaboration_handler';

// const AuthServ
const packageDefinition = protoloader.loadSync(
    [ 
      PROTO_PATHS.AUTH_PROTO_PATH,
      PROTO_PATHS.MESSAGE_PROTO_PATH,
      PROTO_PATHS.NOTIFICATION_PROTO_PATH,
      PROTO_PATHS.TASKCOLLABORATOR_PROTO_PATH,
      PROTO_PATHS.TASK_PROTO_PATH,
      PROTO_PATHS.REMINDER_PROTO_PATH,
      PROTO_PATHS.COLLABORATION_PROTO_PATH
    ],
    PROTO_PATHS.PROTO_LOADER_OPTIONS)

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;

const server = new grpc.Server(
{
    interceptors : [authInterceptor]
}
);
server.addService(protoDescriptor.authPackage.auth.service,authHandlers)
server.addService(protoDescriptor.taskPackage.task.service,taskHandlers)
server.addService(protoDescriptor.taskcollaborator.taskCollaborator.service,taskCollaboratorHandlers)
server.addService(protoDescriptor.messagePackage.messageService.service, messageHandlers)
server.addService(protoDescriptor.notificationPackage.NotificationService.service,notificationHandlers)
server.addService(protoDescriptor.reminderpackage.reminder.service,reminderHandlers)
server.addService(protoDescriptor.CollaborationPackage.CollaborationReq.service,collaboration_handler)

async function connectDB() {
    try{
        await sequelize.authenticate();
        logger.info("DB connected successfully")
        console.log('DB connected Successfully');
    }
    catch(error:any){
        logger.error(`db connection failed ${error.message}`)
        console.log('Error while connecting to DB ', error);
    }
}
connectDB();

const PORT = process.env.GRPC_PORT || "0.0.0.0:50051";

server.bindAsync(PORT,grpc.ServerCredentials.createInsecure(),(err,PORT)=>{
    if(err){
        logger.error(`Failed to connect to gRPC server ${err.message}`)
        console.error('failed to start the server ', err)
        return;
    }

    logger.info(`gRPC server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
});

export default server;