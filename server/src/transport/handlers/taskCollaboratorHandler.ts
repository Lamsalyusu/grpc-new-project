import grpc from '@grpc/grpc-js';
import { createTaskCollaborator, getCollaboratorsByTask, deleteTaskCollaborator, getTasksSharedWithUser } from '../../service/taskCollaboratorServices';

const taskCollaboratorHandlers = {
  CreateCollaborator: async (call: any, callback: any) => {
    try {
      const { task_id, email, requester_id } = call.request;
      const result = await createTaskCollaborator(task_id, requester_id, email);
      callback(null, result);
    } catch (err: any) {
      callback(
              { 
                  code: grpc.status.INTERNAL, 
                  message: err.message || "Internal server error"
               });
    }
  },

  GetCollaborators: async (call: any, callback: any) => {
    try {
      const { task_id, requester_id } = call.request;
      const collaborators = await getCollaboratorsByTask(task_id, requester_id);
      callback(null, { task_id, collaborators });
    } catch (err: any) {
      callback(
        { 
        code: grpc.status.INTERNAL, 
        message: err.message || "Internal server error"
        });
    }
  },

  DeleteCollaborator: async (call: any, callback: any) => {
    try {
      const { task_id, user_id, requester_id } = call.request;
      await deleteTaskCollaborator(task_id, requester_id, user_id);
      callback(null, { message: 'Collaborator removed successfully' });
    } catch (err: any) {
      callback(
        { 
        code: grpc.status.INTERNAL, 
        message: err.message || "Internal server error"
        });
    }
  },

  GetSharedTasks: async (call: any, callback: any) => {
    try {
      const { requester_id } = call.request;
      const tasks = await getTasksSharedWithUser(requester_id);
      callback(null, { tasks });
    } catch (err: any) {
      callback(
        { 
        code: grpc.status.INTERNAL, 
        message: err.message || "Internal server error"
        });
    }
  },
};

export default taskCollaboratorHandlers;