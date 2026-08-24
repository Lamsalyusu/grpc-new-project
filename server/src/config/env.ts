import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const PROTO_DIR = path.resolve(process.cwd(),'../proto')

const ENV = {
    PORT :process.env.GRPC_PORT || 50051,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET:process.env.JWT_SECRET,

    AUTH_PROTO_PATH: path.join(PROTO_DIR,'auth.proto'),
    TASK_PROTO_PATH: path.join(PROTO_DIR,'task.proto'),
    TASKCOLLABORATOR_PROTO_PATH: path.join(PROTO_DIR,'taskcollaborator.proto'),
    MESSAGE_PROTO_PATH: path.join(PROTO_DIR,'message.proto'),
    NOTIFICATION_PROTO_PATH: path.join(PROTO_DIR,'notification.proto'),

    PROTO_LOADER_OPTION : {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
}
export default ENV;
// ENV.AUTH_PROTO_PATH