import * as grpc from"@grpc/grpc-js";
import { registerAdmin,loginAdmin, seeAllUsers, seeUser, deleteUser, updateUser } from "../service/adminService";
import { findAdminById } from "../repositories/adminRepository";
import { createTaskForAdmin,getTasksCreatedByAdmin } from "../service/taskService";
import getUserFromCall from "../utils/getUser";
import logger from "../utils/logger";

const adminHandlers = {
    registerAdmin:async(call:any, callback:any) => {
        try{
            const {name,email,password} = call.request;
            const result = await registerAdmin({name,email,password})
            callback(null,result);
        }
        catch(err:any){
            callback({
                code:grpc.status.INTERNAL,
                message:err.message || "failed registration of admin"
            })

        }
    },

    loginAdmin:async(call:any, callback:any)=>{
        try{
            const { email, password } = call.request;
            const result = await loginAdmin({ email, password });
            callback(null,result)
        }
        catch(err:any){
            callback({
                code: grpc.status.UNAUTHENTICATED,
                message: err.message
            })
        }
    },

    seeProfile:async(_call:any,_callback:any)=>{
            return
    },

    seeAllUsers: async (_call: any, callback: any) => {
        try {
            const result = await seeAllUsers();
            callback(null, result);
        } catch (err: any) {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message || "failed to fetch user"
            });
        }
    },
    
    seeUser:async (call:any,callback:any)=>{
        try{
            const {user_id} = call.request;
            const result = await seeUser(user_id)
            callback(null,result)
        }
        catch(err:any){
            callback({
                code:grpc.status.NOT_FOUND,
                message:err.message || "user not found"
            })
        }
    },

    deleteUser:async(call:any,callback:any)=>{
        try{
            const {user_id}= call.request;
            const result = await deleteUser(user_id)
            callback(null,result)
        }
        catch(err:any){
            callback({
                code:grpc.status.NOT_FOUND,
                message:err.message || "failed to delete user"
            })
        }
    },

    updateUser: async (call: any, callback: any) => {
        try {
            const { user_id, name, email, role } = call.request;
            const result = await updateUser(user_id, { name, email, role });
            callback(null, result);
        } catch (err: any) {
            callback({
                code: grpc.status.INTERNAL,
                message: err.message || "failed to update user",
            });
        }
    },

    createTaskForUser: async (call: any, callback: any) => {
        try{
            const admin = getUserFromCall(call);
            logger.info({ message: "Admin task creation requested", adminId: admin.id });
            if (admin.role !== "admin") {
            return callback({
                code: grpc.status.PERMISSION_DENIED,
                message: "Admin access required",
            });
        }
            const {owner_id,title,description,priority,due_date,reminder_at} = call.request;
            const task = await createTaskForAdmin({owner_id,title,description,priority,due_date,reminder_at},admin.id,);
            return callback(null, task);
            } catch (err: any) {
                return callback({
                code: grpc.status.INTERNAL,
                message: err.message || "Failed to create task",
            });
        }
    },


    seeAdminTasks: async (call: any, callback: any) => {
        try {
            const admin = getUserFromCall(call);
            if (admin.role !== "admin") {
            return callback({
                code: grpc.status.PERMISSION_DENIED,
                message: "Admin access required",
            });
            }
        const result = await getTasksCreatedByAdmin(admin.id);

        return callback(null, result);
        } catch (err: any) {
            return callback({
            code: grpc.status.INTERNAL,
            message: err.message || "Failed to fetch admin tasks",
            });
        }
    },
}
export default adminHandlers;
