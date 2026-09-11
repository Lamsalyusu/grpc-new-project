import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader'
import PROTO_PATHS from "../../../server/src/index";
const packageDefinition = protoloader.loadSync(PROTO_PATHS.NOTIFICATION_PROTO_PATH, PROTO_PATHS.PROTO_LOADER_OPTIONS);
const notificationProto = grpc.loadPackageDefinition(packageDefinition) as any;

const NotificationService = notificationProto.notificationPackage.NotificationService;
const NOTIFICATION_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const NotificationClient = new NotificationService( NOTIFICATION_HOST_URL, grpc.credentials.createInsecure());
export default NotificationClient;