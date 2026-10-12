import * as grpc from '@grpc/grpc-js';
// import path from 'path';
import * as protoloader from '@grpc/proto-loader'
import PROTO_PATHS from "../index"

const packageDefinition = protoloader.loadSync(PROTO_PATHS.ADMIN_PROTO_PATH, PROTO_PATHS.PROTO_LOADER_OPTIONS);
const adminProto = grpc.loadPackageDefinition(packageDefinition) as any;
const adminService = adminProto.adminPackage.adminService;

const ADMIN_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const adminClient = new adminService( ADMIN_HOST_URL, grpc.credentials.createInsecure());
export default adminClient;