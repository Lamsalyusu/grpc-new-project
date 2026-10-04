function getUserFromCall(call: any) {
  const raw = call.metadata.get("user")[0] as string;
  return JSON.parse(raw);
}
export default getUserFromCall;