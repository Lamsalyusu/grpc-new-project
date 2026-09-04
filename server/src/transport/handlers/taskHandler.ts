import grpc from '@grpc/grpc-js';
import { createTask, getTaskById, getTasksByOwner, updateTask, deleteTask } from '../../service/taskService';
import authInterceptor from '../../interceptors/authInterceptors';

function getUserFromCall(call: any) {
  const raw = call.metadata.get('user')[0] as string;   // ← "user", not "decodedToken"
  return JSON.parse(raw);
}
const taskHandlers = {
  CreateTask: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      const { title, description, priority, due_date } = call.request;
      const task = await createTask({ title, description, priority, due_date }, user.id);
      callback(null, task);
    } catch (err: any) {
      callback({ 
        // code: grpc.status.INTERNAL, 
        message: err.message || "Internal server error" });
    }
  },

  GetOne: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      const { id } = call.request;
      const task = await getTaskById(id, user.id);
      callback(null, { task });
    } catch (err: any) {
      callback({ 
        // code: grpc.status.INTERNAL, 
        message: err.message || "Internal server error" });
    }
  },

  // GetAllTask: async (call: any, callback: any) => {
  //   try {
  //     const user = getUserFromCall(call);
  //     const { status, priority, page, limit, sort_by, order } = call.request;
  //     const result = await getTasksByOwner(user.id, { status, priority, page, limit, sortBy: sort_by, order });
  //     callback(null, { count: result.count, tasks: result.rows });
  //   } catch (err: any) {
  //     callback({ code: grpc.status.INTERNAL, message: err.message || "Internal server error" });
  //   }
  // },

        GetAllTask: async (call: any, callback: any) => {
        try {
          const user = getUserFromCall(call);
          // const { status, priority, page, limit, sort_by, order } = call.request;
          const {status,priority,page,limit,sort_by,order} = call.request;
          const result = await getTasksByOwner(user.id, {
            status:status,
            priority:priority,
            page: page || 1,
            limit: limit || 10,
            sortBy: sort_by || 'created_at',
            order: order || 'desc',
          });
          callback(null, { count: result.count, tasks: result.rows });
        } catch (err: any) {
          callback({ 
            // code: grpc.status.INTERNAL, 
            message: err.message || "Internal server error" });
        }
      },

  Update: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      const { id, ...data } = call.request;
      const task = await updateTask(data, user.id, id);
      callback(null, { task });
    } catch (err: any) {
      callback({ 
        // code: grpc.status.INTERNAL, 
        message: err.message || "Internal server error" });
    }
  },

  Remove: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      const { id } = call.request;
      await deleteTask(id, user.id);
      callback(null, { message: 'Task deleted successfully' });
    } catch (err: any) {
      callback({ 
        // code: grpc.status.INTERNAL,
         message: err.message || "Internal server error" });
    }
  },
};

export default taskHandlers;