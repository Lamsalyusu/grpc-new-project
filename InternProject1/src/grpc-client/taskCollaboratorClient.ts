import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader'
import ENV from "../../../server/src/config/env";
const packageDefinition = protoloader.loadSync(ENV.TASKCOLLABORATOR_PROTO_PATH, ENV.PROTO_LOADER_OPTIONS,);
const taskCollaboratorProto = grpc.loadPackageDefinition(packageDefinition) as any;
const TaskCollaboratorService = taskCollaboratorProto.taskcollaborator.taskCollaborator;
const TASK_COLLABORATOR_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const TaskCollaboratorClient = new TaskCollaboratorService( TASK_COLLABORATOR_HOST_URL, grpc.credentials.createInsecure());
export default TaskCollaboratorClient;