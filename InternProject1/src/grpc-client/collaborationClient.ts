import * as grpc from '@grpc/grpc-js';
// import path from 'path';
import * as protoloader from '@grpc/proto-loader'
import PROTO_PATHS from "../index"
// const PROTO_PATH = path.resolve(__filename,'server/src/index.ts')


const packageDefinition = protoloader.loadSync(PROTO_PATHS.COLLABORATION_PROTO_PATH, PROTO_PATHS.PROTO_LOADER_OPTIONS);
const collaborationProto = grpc.loadPackageDefinition(packageDefinition) as any;
const CollaborationService = collaborationProto.CollaborationPackage.CollaborationReq;

const COLLABORATION_HOST_URL = process.env.GRPC_CLIENT_URL || 'localhost:50051';
const CollaborationClient = new CollaborationService( COLLABORATION_HOST_URL, grpc.credentials.createInsecure());
export default CollaborationClient;
