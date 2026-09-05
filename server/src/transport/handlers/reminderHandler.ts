async function reminderHandler(call:any){
const user = getUserFromCall(call);
return user;
}
export default reminderHandler;

function getUserFromCall(call: any) {
    throw new Error("Function not implemented.");
}
