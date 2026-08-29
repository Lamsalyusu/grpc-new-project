import { Task, TaskCollaborator, User } from "../models";


//--> is this specific person a collaborator on this specific task 
async function findOne(task_id:string,user_id:string){
    return TaskCollaborator.findOne({where:{task_id,user_id}});
}

// --> who are the collaborators on this task
async function findAllByTask(task_id: string) {
  return TaskCollaborator.findAll({
    where: { task_id },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });
}

async function add(task_id:string,user_id:string){
    return TaskCollaborator.create({user_id,task_id});
}

async function remove(task_id:string,user_id:string){
    return TaskCollaborator.destroy({where:{task_id,user_id}})
}

// taskCollaboratorRepository.ts — add this
async function findTasksForUser(user_id: string) {
  return TaskCollaborator.findAll({
    where: { user_id },
    include: [{ model: Task }],   // requires the Task↔TaskCollaborator association
  });
}
export {findOne,findAllByTask,add,remove,findTasksForUser};