import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader'
import ENV from "../../../server/src/config/env";
const packageDefinition = protoloader.loadSync(ENV.NOTIFICATION_PROTO_PATH, ENV.PROTO_LOADER_OPTIONS,);
const notificationProto = grpc.loadPackageDefinition(packageDefinition) as any;

const jwtInterceptor = (options:any, nextCall:any) => {

  const requester:any = new grpc.RequesterBuilder().withStart(
    (metadata, listener, next) => {
      next(metadata, listener);
    }
  );

  return new grpc.InterceptingCall(nextCall(options), requester);
};
const NotificationService = notificationProto.notificationPackage.NotificationService;
const NOTIFICATION_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const NotificationClient = new NotificationService( NOTIFICATION_HOST_URL, grpc.credentials.createInsecure(),{interceptors: [jwtInterceptor]});
export default NotificationClient;