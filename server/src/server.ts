import dotenv from "dotenv";
import path from 'path';
const envpath = path.join(__dirname,"/config/.env")
dotenv.config({path:envpath});

// import .env

import authHandlers from "./handlers/authHandler";
import taskHandlers from "./handlers/taskHandler";
import taskCollaboratorHandlers from "./handlers/taskCollaboratorHandler";
import messageHandlers from "./handlers/messageHandler";
import notificationHandlers from "./handlers/notificationHandler";
import reminderHandlers from "./handlers/reminderHandler";
import collaboration_handler from "./handlers/collaboration_handler";
import adminHandler from "./handlers/adminHandler"
import PROTO_PATHS from "./index";
import authInterceptor from "./interceptors/authInterceptors";

import * as grpc from "@grpc/grpc-js";
import * as protoloader from "@grpc/proto-loader";
import sequelize from "./db/connection";
import logger from "./utils/logger";

// import morgan from 'morgan'
// const AuthServ
const packageDefinition = protoloader.loadSync(
  [
    PROTO_PATHS.AUTH_PROTO_PATH,
    PROTO_PATHS.MESSAGE_PROTO_PATH,
    PROTO_PATHS.NOTIFICATION_PROTO_PATH,
    PROTO_PATHS.TASKCOLLABORATOR_PROTO_PATH,
    PROTO_PATHS.TASK_PROTO_PATH,
    PROTO_PATHS.REMINDER_PROTO_PATH,
    PROTO_PATHS.COLLABORATION_PROTO_PATH,
    PROTO_PATHS.ADMIN_PROTO_PATH
  ],
  PROTO_PATHS.PROTO_LOADER_OPTIONS,
);

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;

const server = new grpc.Server({
  interceptors: [authInterceptor],
});
server.addService(
  protoDescriptor.authPackage.authService.service,
  authHandlers,
);
server.addService(
  protoDescriptor.taskPackage.taskService.service,
  taskHandlers,
);
server.addService(
  protoDescriptor.taskCollaboratorPackage.taskCollaboratorService.service,
  taskCollaboratorHandlers,
);
server.addService(
  protoDescriptor.messagePackage.messageService.service,
  messageHandlers,
);
server.addService(
  protoDescriptor.notificationPackage.notificationService.service,
  notificationHandlers,
);
server.addService(
  protoDescriptor.reminderPackage.reminderService.service,
  reminderHandlers,
);
server.addService(
  protoDescriptor.collaborationPackage.collaborationService.service,
  collaboration_handler,
);
server.addService(
  protoDescriptor.adminPackage.adminService.service,
  adminHandler
)

async function connectDB() {
  try {
    await sequelize.authenticate();
    logger.info("DB connected successfully");
  } catch (error: any) {
    logger.error({ message: "Database connection failed", error });
  }
}

const PORT = process.env.GRPC_PORT || "127.0.0.1:50051";

server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err, PORT) => {
  if (err) {
    logger.error(`Failed to connect to gRPC server ${err.message}`);
    return;
  }

  logger.info(`gRPC server running on port ${PORT}`);
  connectDB();
});

export default server;
