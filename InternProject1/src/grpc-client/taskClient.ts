import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader'
import PROTO_PATHS from "../../../server/src/index";

const packageDefinition = protoloader.loadSync(PROTO_PATHS.TASK_PROTO_PATH, PROTO_PATHS.PROTO_LOADER_OPTIONS);
const taskProto = grpc.loadPackageDefinition(packageDefinition) as any;
const TaskService = taskProto.taskPackage.task;

const TASK_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const TaskClient = new TaskService( TASK_HOST_URL, grpc.credentials.createInsecure());
export default TaskClient;