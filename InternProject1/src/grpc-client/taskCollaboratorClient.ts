import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader'
import PROTO_PATHS from "../../../server/src/index";
const packageDefinition = protoloader.loadSync(PROTO_PATHS.TASKCOLLABORATOR_PROTO_PATH, PROTO_PATHS.PROTO_LOADER_OPTIONS);
const taskCollaboratorProto = grpc.loadPackageDefinition(packageDefinition) as any;
const TaskCollaboratorService = taskCollaboratorProto.taskcollaborator.taskCollaborator;
const TASK_COLLABORATOR_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const TaskCollaboratorClient = new TaskCollaboratorService( TASK_COLLABORATOR_HOST_URL, grpc.credentials.createInsecure());
export default TaskCollaboratorClient;