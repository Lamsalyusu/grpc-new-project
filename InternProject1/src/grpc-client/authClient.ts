import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader'
import PROTO_PATHS from "../../../server/src/index"


const packageDefinition = protoloader.loadSync(PROTO_PATHS.AUTH_PROTO_PATH, PROTO_PATHS.PROTO_LOADER_OPTIONS);
const authProto = grpc.loadPackageDefinition(packageDefinition) as any;
const AuthService = authProto.authPackage.auth;

const AUTH_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const AuthClient = new AuthService( AUTH_HOST_URL, grpc.credentials.createInsecure());
export default AuthClient;