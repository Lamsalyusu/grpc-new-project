import path from 'path';
const PROTO_DIR = path.resolve(__dirname, '../../proto'); 
// import {proto} from '../../proto'

const PROTO_PATHS = {
  AUTH_PROTO_PATH: path.join(PROTO_DIR, 'auth.proto'),
  TASK_PROTO_PATH: path.join(PROTO_DIR, 'task.proto'),
  TASKCOLLABORATOR_PROTO_PATH: path.join(PROTO_DIR, 'taskcollaborator.proto'),
  MESSAGE_PROTO_PATH: path.join(PROTO_DIR, 'message.proto'),
  NOTIFICATION_PROTO_PATH: path.join(PROTO_DIR, 'notification.proto'),
  REMINDER_PROTO_PATH: path.join(PROTO_DIR,'reminder.proto'),

  PROTO_LOADER_OPTIONS: {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
};

export default PROTO_PATHS;