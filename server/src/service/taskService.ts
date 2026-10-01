// import messages from "../models/messageModel";
import { findOne as findCollaborator } from "../repositories/taskCollaboratorRepository";
import { findById,create,findByOwner,remove,update} from "../repositories/taskRepository";
import { taskqueryschema, Taskrequire } from "../validators/taskValidator";
import {addCollaborator as addTaskCollaborator} from "../repositories/taskCollaboratorRepository";
import { doubleRequest } from "../repositories/collaborationRepository";

async function createTask(data:Taskrequire,owner_id:string){

const collaborator_ids = data.collaborator_ids || [];

for(const collaborator_id of collaborator_ids){
     if (collaborator_id === owner_id) {
        throw {
            message: "You cannot add yourself as a collaborator"
        };
    }
    const isCollaborator = await doubleRequest(owner_id,collaborator_id);
    if(!isCollaborator){
        throw{
            message:"user is not an accepted collaborator"
        }
    }
}

    const Tasks = await create({
        priority : data.priority || 'medium',
        description:data.description,
        status:data.status,
        title :data.title,
        due_date:data.due_date,
        reminder_at:data.reminder_at,
        reminder_status:data.reminder_status,
        owner_id
    });

    for (const collaborator_id of collaborator_ids) {
        await addTaskCollaborator(
            Tasks.id,
            collaborator_id
        );
    }

    return Tasks;
}

async function getTaskById(id:string,reqid:string){
    const getTask = await findById(id);
    if(!getTask){
        throw {message:"doesnot exists"}
    }
    const isOwner = getTask.owner_id === reqid;
    const isCollaborator = await findCollaborator(id, reqid);

    if (!isOwner && !isCollaborator) {
    throw {  message: "Not authorized to view this task" };
  }
    return getTask;
}


async function getTasksByOwner(owner_id:string,filter:taskqueryschema){
const getownertask = await findByOwner(owner_id,filter);
return getownertask;
}


async function updateTask(data:Taskrequire,reqid:string,id:string){
    // const uptask = await update(data,id)
    const upTask = await findById(id);
    if(!upTask){
        throw {message:"task doesnot exists"}
    }
    if(upTask.owner_id !== reqid){
        throw {message:'not their task'}
    }
    // const newuptask = await update(id,data);
    // if(newuptask?.reminder_at === data.reminder_at){
    //     return newuptask

    // }
    // return newuptask;
    //check if the updated tasks reminder date and edited reminder_date are actually different or not 
    // const reminder_changed = data.reminder_at && data.reminder_at !== uptask.reminder_at;
    const reminder_changed = data.reminder_at && new Date(data.reminder_at).getTime() !== new Date(upTask.reminder_at).getTime();
    // if reminder_at is changed 
    // if(data.status === "completed"){
    //     // reminder_status:"sent"
    //     {
            
    //     }
    // }
    const updateData = reminder_changed ? {...data,reminder_status:"pending"} : {...data}
    if(updateData.status === "completed"){
        updateData.reminder_status = "sent";
        // return updateData;
    }
    // update the task based on the id and updatedata so that after the the reminder is changed we can fire the reminer again 
    const newUpdateTask = update(id,updateData);
    return newUpdateTask;
}

async function deleteTask(id:string,reqid:string){
    const tasktodel = await findById(id);
    if (!tasktodel){
        throw {message:'task doesnot exists'}
    }
    if (tasktodel.owner_id !== reqid){
        throw {message:'not their task'}
    }
    const delTask = await remove(id);
    return delTask;
}



// export {createTask,deleteTask,updateTask,getTaskById,getTasksByOwner}

// export {createTask}

export {deleteTask,updateTask,createTask,getTasksByOwner,getTaskById}