import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader'
import ENV from "../../../server/src/config/env";
const packageDefinition = protoloader.loadSync(ENV.TASK_PROTO_PATH, ENV.PROTO_LOADER_OPTIONS,);
const taskProto = grpc.loadPackageDefinition(packageDefinition) as any;
const TaskService = taskProto.taskPackage.task;
const TASK_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const TaskClient = new TaskService( TASK_HOST_URL, grpc.credentials.createInsecure());
export default TaskClient;