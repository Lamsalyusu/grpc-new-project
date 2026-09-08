import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader'
import ENV from "../../../server/src/config/env";
const packageDefinition = protoloader.loadSync(ENV.REMINDER_PROTO_PATH, ENV.PROTO_LOADER_OPTIONS,);
const reminderProto = grpc.loadPackageDefinition(packageDefinition) as any;
const ReminderService = reminderProto.reminderpackage.reminder;
const REMINDER_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const ReminderClient = new ReminderService(REMINDER_HOST_URL, grpc.credentials.createInsecure());
export default ReminderClient;