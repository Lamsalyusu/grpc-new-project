import grpc from '@grpc/grpc-js';
import { createTask, getTaskById, getTasksByOwner, updateTask, deleteTask } from '../../service/taskService';
import authInterceptor from '../../interceptors/authInterceptors';


const taskHandlers = {
  CreateTask: async (call: any, callback: any) => {
    try {
      // const user = authInterceptor(call,callback);
      const { title, description, priority, due_date, owner_id } = call.request;
      const task = await createTask({ title, description, priority, due_date }, owner_id);
      callback(null, task);
    } catch (err: any) {
      callback({
            code: grpc.status.INTERNAL, 
            message: err.message || "Internal server error"
        });
    }
  },

  GetOneTask: async (call: any, callback: any) => {
    try {
      const { id, requester_id } = call.request;
      const task = await getTaskById(id, requester_id);
      callback(null, { task });
    } catch (err: any) {
      callback(
        { 
            code: grpc.status.INTERNAL, 
            message: err.message || "Internal server errorr"
         });
    }
  },

  GetAllTasks: async (call: any, callback: any) => {
    try {
      const { owner_id, status, priority, page, limit, sort_by, order } = call.request;
      const result = await getTasksByOwner(owner_id, { status, priority, page, limit, sortBy: sort_by, order });
      callback(null, { count: result.count, tasks: result.rows });
    } catch (err: any) {
      callback(
        { 
            code: grpc.status.INTERNAL, 
            message: err.message || "Internal server error"
         });
    }
  },

  UpdateTask: async (call: any, callback: any) => {
    try {
      const { id, requester_id, ...data } = call.request;
      const task = await updateTask(data, requester_id, id);
      callback(null, { task });
    } catch (err: any) {
      callback(
        { 
            code: grpc.status.INTERNAL, 
            message: err.message || "Internal server error"
         });
    }
  },

  RemoveTask: async (call: any, callback: any) => {
    try {
      const { id, requester_id } = call.request;
      await deleteTask(id, requester_id);
      callback(null, { message: 'Task deleted successfully' });
    } catch (err: any) {
      callback(
        { 
            code: grpc.status.INTERNAL, 
            message: err.message || "Internal server error"
         });
    }
  },
};

export default taskHandlers;