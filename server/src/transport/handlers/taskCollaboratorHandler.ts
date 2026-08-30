import grpc from '@grpc/grpc-js';
import { createTaskCollaborator, getCollaboratorsByTask, deleteTaskCollaborator, getTasksSharedWithUser } from '../../service/taskCollaboratorServices';

function getUserFromCall(call: any) {
  const raw = call.metadata.get('user')[0] as string;
  return JSON.parse(raw);
}

const taskCollaboratorHandlers = {
  CreateCollaborator: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      // const { task_id, email, requester_id } = call.request;
      const { task_id,email } = call.request;
      // const result = await createTaskCollaborator(task_id, requester_id, email);
      const result = await createTaskCollaborator(task_id,user.id,email)
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
      const user = getUserFromCall(call);
      // const { task_id, requester_id } = call.request;
      const {task_id} = call.request;
      // const collaborators = await getCollaboratorsByTask(task_id, requester_id);
      const collaborators = await getCollaboratorsByTask(task_id,user.id)
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
      const user = getUserFromCall(call);
      // const { task_id, user_id, requester_id } = call.request;
      const {task_id,user_id} = call.request;
      // await deleteTaskCollaborator(task_id, requester_id, user_id);
      await deleteTaskCollaborator(task_id,user.id, user_id);
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
      // const { requester_id } = call.request;
      const user = getUserFromCall(call);
      // const tasks = await getTasksSharedWithUser(requester_id);
      const tasks = await getTasksSharedWithUser(user.id);
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