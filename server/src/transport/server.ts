import dotenv from 'dotenv';
dotenv.config();
import { ReflectionService } from '@grpc/reflection';
import authHandlers from "./handlers/authHandler";
import taskHandlers from "./handlers/taskHandler";
// import taskCollaboratorHandlers from "./handlers/taskCollaboratorHandler";
// import messageHandlers from "./handlers/messageHandler";
// import notificationHandlers from "./handlers/notificationHandler";
// import reminderHandlers from "./handlers/reminderHandler";
import ENV from "../config/env";
import authInterceptor from '../interceptors/authInterceptors';

import * as grpc from '@grpc/grpc-js'
import * as protoloader from '@grpc/proto-loader';
import sequelize from '../db/connection';

// const AuthServ
const packageDefinition = protoloader.loadSync([ 
      ENV.AUTH_PROTO_PATH,
    //   ENV.MESSAGE_PROTO_PATH,
    //   ENV.NOTIFICATION_PROTO_PATH,
    //   ENV.TASKCOLLABORATOR_PROTO_PATH,
      ENV.TASK_PROTO_PATH,
    //   ENV.REMINDER_PROTO_PATH,
    ],ENV.PROTO_LOADER_OPTIONS)

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;

const server = new grpc.Server(
{
    interceptors :[authInterceptor]
}
);
// server.use(authInterceptor)
server.addService(protoDescriptor.authPackage.auth.service,authHandlers)
server.addService(protoDescriptor.taskPackage.task.service,taskHandlers)
// server.addService(protoDescriptor.taskcollaborator.taskCollaborator.service,taskCollaboratorHandlers)
// server.addService(protoDescriptor.messagePackage.messageService.service, messageHandlers)
// server.addService(protoDescriptor.notificationPackage.NotificationService.service,notificationHandlers)
// server.addService(protoDescriptor.reminderpackage.reminder.service,reminderHandlers)

const reflection = new ReflectionService(packageDefinition);
reflection.addToServer(server);


async function connectDB() {
    try{
        await sequelize.authenticate();
        console.log('DB connected Successfully');
    }
    catch(error){
        console.log('Error while connecting to DB ', error)
    }
}
connectDB();

const PORT = process.env.GRPC_PORT || "0.0.0.0:50051";

server.bindAsync(PORT,grpc.ServerCredentials.createInsecure(),(err,PORT)=>{
    if(err){
        console.error('failed to start the server ', err)
        return;
    }
    console.log(`Server running on port ${PORT}`);
    // server.start
});

export default server;