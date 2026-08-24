import { findOne,add,findAllByTask,remove } from "../repositories/taskCollaboratorRepository";
import { findById } from "../repositories/taskRepository";
import { findByEmail } from "../repositories/userRepository";
import { findTasksForUser } from "../repositories/taskCollaboratorRepository";

// ---- Add a collaborator to a task ----
async function createTaskCollaborator(task_id:string,reqid:string,email:string){
    //confirm if a task actually exists
    const task = await findById(task_id);
    if(!task){
        throw{status:404,message:'task not found'};
    }

    //only the owner can add a collaborator
    if(task.owner_id !== reqid){
        throw {status:403,message:'only the task owner can add collaborators'}
    }

    //find the collaborator to add via email
    const usertoadd = await findByEmail(email);
    if(!usertoadd){
        throw{status:404,message:'no user foubd with that email'};
    }
    //prevent adding the owner as their own collaborator
    if (usertoadd.id === task.owner_id){
        throw {status:400,message:'owner cannot be added as a collaborator'};
    }
    
    // prevent adding double collaborator to single task
    const aleadycollab = await findOne(task_id,usertoadd.id);
    if(aleadycollab){
        throw {status:409,message:"user already a collaborator on this task"}
    }
    //add a new collaborator to the task
    const newcolab = await add(task_id,usertoadd.id)
        return newcolab;
    
}

//get the all collaborators on a task
async function getCollaboratorsByTask(task_id:string,reqid:string){
    const task = await findById(task_id);
    if(!task){
        throw {status:404,message:'task not found'}
    }
    const isOwner = task.owner_id === reqid;
    const isCollaborator = await findOne(task_id, reqid);

    if (!isOwner && !isCollaborator) {
        throw { status: 403, message: 'not authorized to view this task\'s collaborators' };
    }

    const collaboratos = await findAllByTask(task_id);
    return collaboratos;
}

async function deleteTaskCollaborator(task_id:string,reqid:string,user_id:string){
const deltask = await findById(task_id);
if(!deltask){
    throw {status :404,message:'task not found'}
}
if (deltask.owner_id !== reqid){
    throw{status :403,message:'only the task owner can remove the task'}
}
const delcollaborator = await remove(task_id,user_id);
if(delcollaborator === 0){
    throw {status:404,message:'no collaborator found on this task'}
}
}
async function getTasksSharedWithUser(user_id: string) {
  return findTasksForUser(user_id);
}

export {createTaskCollaborator,deleteTaskCollaborator,getCollaboratorsByTask,getTasksSharedWithUser}