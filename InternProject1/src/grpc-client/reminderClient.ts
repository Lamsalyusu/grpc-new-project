import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader'
import PROTO_PATHS from "../../../server/src/index";

const packageDefinition = protoloader.loadSync(PROTO_PATHS.REMINDER_PROTO_PATH, PROTO_PATHS.PROTO_LOADER_OPTIONS);
const reminderProto = grpc.loadPackageDefinition(packageDefinition) as any;
const ReminderService = reminderProto.reminderpackage.reminder;

const REMINDER_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const ReminderClient = new ReminderService(REMINDER_HOST_URL, grpc.credentials.createInsecure());
export default ReminderClient;