import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader'
import PROTO_PATHS from "../../../server/src/index";
const packageDefinition = protoloader.loadSync(PROTO_PATHS.MESSAGE_PROTO_PATH, PROTO_PATHS.PROTO_LOADER_OPTIONS);
const messageProto = grpc.loadPackageDefinition(packageDefinition) as any;

const MessageService = messageProto.messagePackage.messageService;
const MESSAGE_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const MessageClient = new MessageService( MESSAGE_HOST_URL, grpc.credentials.createInsecure());
export default MessageClient;