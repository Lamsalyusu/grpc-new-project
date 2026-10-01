import { findOne,addCollaborator,findAllByTask,remove } from "../repositories/taskCollaboratorRepository";
import { findById } from "../repositories/taskRepository";
import { findById as id } from "../repositories/userRepository";
import { findTasksForUser } from "../repositories/taskCollaboratorRepository";

// Add a colaborator to a task 
async function createTaskCollaborator(task_id:string,reqid:string,user_id:string){
    //confirm if a task actually exists
    const task = await findById(task_id);
    if(!task){
        throw{message:'task not found'};
    }

    //only the owner can add a collaborator
    if(task.owner_id !== reqid){
        throw {message:'only the task owner can add collaborators'}
    }

    //find the collaborator to add via email
    const userToAdd = await id(user_id);
    if(!userToAdd){
        throw{message:'no user found with that id'};
    }
    //prevent adding the owner as their own collaborator
    if (userToAdd.id === task.owner_id){
        throw { message:'owner cannot be added as a collaborator'};
    }
    
    // prevent adding double collaborator to single task
    const aleadyCollab = await findOne(task_id,userToAdd.id);
    if(aleadyCollab){
        throw {message:"user already a collaborator on this task"}
    }
    //add a new collaborator to the task
    const newColab = await addCollaborator(task_id,userToAdd.id)
        return newColab;
    
}

//get the all collaborators on a task
async function getCollaboratorsByTask(task_id:string,reqid:string){
    const task = await findById(task_id);
    if(!task){
        throw {message:'task not found'}
    }
    const isOwner = task.owner_id === reqid;
    const isCollaborator = await findOne(task_id, reqid);

    if (!isOwner && !isCollaborator) {
        throw {message: 'not authorized to view this task\'s collaborators' };
    }

    const collaborators = await findAllByTask(task_id);
    return collaborators;
}

async function deleteTaskCollaborator(task_id:string,reqid:string,user_id:string){
const deltask = await findById(task_id);
if(!deltask){
    throw {message:'task not found'}
}
if (deltask.owner_id !== reqid){
    throw{message:'only the task owner can remove the task'}
}
const delCollaborator = await remove(task_id,user_id);
if(delCollaborator === 0){
    throw {message:'no collaborator found on this task'}
}
}
async function getTasksSharedWithUser(user_id: string) {
  return findTasksForUser(user_id);
}

export {createTaskCollaborator,deleteTaskCollaborator,getCollaboratorsByTask,getTasksSharedWithUser}