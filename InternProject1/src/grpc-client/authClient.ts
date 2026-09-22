import * as grpc from '@grpc/grpc-js';
import path from 'path';
import * as protoloader from '@grpc/proto-loader'
import PROTO_PATHS from "../index"
// const PROTO_PATH = path.resolve(__filename,'server/src/index.ts')


const packageDefinition = protoloader.loadSync(PROTO_PATHS.AUTH_PROTO_PATH, PROTO_PATHS.PROTO_LOADER_OPTIONS);
const authProto = grpc.loadPackageDefinition(packageDefinition) as any;
const AuthService = authProto.authPackage.auth;

const AUTH_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const AuthClient = new AuthService( AUTH_HOST_URL, grpc.credentials.createInsecure());
export default AuthClient;