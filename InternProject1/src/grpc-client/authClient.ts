import * as grpc from '@grpc/grpc-js';
import * as protoloader from '@grpc/proto-loader'
import ENV from "../../../server/src/config/env";
const packageDefinition = protoloader.loadSync(ENV.AUTH_PROTO_PATH, ENV.PROTO_LOADER_OPTIONS,);
const authProto = grpc.loadPackageDefinition(packageDefinition) as any;
const AuthService = authProto.authPackage.auth;
const AUTH_HOST_URL = process.env.PORT || 'localhost:50051';
const AuthClient = new AuthService( AUTH_HOST_URL, grpc.credentials.createInsecure());
export default AuthClient;