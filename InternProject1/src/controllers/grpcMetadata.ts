import * as grpc from '@grpc/grpc-js';
import { Request } from "express";
export function buildMetadata(req: Request): grpc.Metadata {
  const md = new grpc.Metadata();
  const authHeader = req.headers.authorization;
  if (authHeader) {
    md.set('authorization', authHeader);
  }
  return md;
}