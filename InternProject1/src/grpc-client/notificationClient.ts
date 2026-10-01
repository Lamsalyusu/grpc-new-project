import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader'
import PROTO_PATHS from "../index";
const packageDefinition = protoloader.loadSync(PROTO_PATHS.NOTIFICATION_PROTO_PATH, PROTO_PATHS.PROTO_LOADER_OPTIONS);
const notificationProto = grpc.loadPackageDefinition(packageDefinition) as any;

const notificationService = notificationProto.notificationPackage.notificationService;
const NOTIFICATION_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const notificationClient = new notificationService( NOTIFICATION_HOST_URL, grpc.credentials.createInsecure());
export default notificationClient;