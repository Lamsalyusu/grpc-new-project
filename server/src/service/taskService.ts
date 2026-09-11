// import messages from "../models/messageModel";
import { findOne as findCollaborator } from "../repositories/taskCollaboratorRepository";
import { findById,create,findByOwner,remove,update} from "../repositories/taskRepository";
// import { taskqueryschema,Taskrequire } from "../validators/taskValidator";

async function createTask(data:any,owner_id:string){
    const Tasks = await create({
        priority : data.priority || 'medium',
        description:data.description,
        status:data.status,
        title :data.title,
        due_date:data.due_date,
        reminder_at:data.reminder_at,
        owner_id
    })
    return Tasks;
}

async function getTaskById(id:string,reqid:string){
    const gettask = await findById(id);
    if(!gettask){
        throw {status:404,message:"doesnot exists"}
    }
    const isOwner = gettask.owner_id === reqid;
    const isCollaborator = await findCollaborator(id, reqid);

    if (!isOwner && !isCollaborator) {
    throw { status: 403, message: "Not authorized to view this task" };
  }
    return gettask;
}


async function getTasksByOwner(owner_id:string,filter:any){
const getownertask = await findByOwner(owner_id,filter);
return getownertask;
}


async function updateTask(data:any,reqid:string,id:string){
    // const uptask = await update(data,id)
    const uptask = await findById(id);
    if(!uptask){
        throw {status:404,message:"task doesnot exists"}
    }
    if(uptask.owner_id !== reqid){
        throw {status:403,message:'not their task'}
    }
    // const newuptask = await update(id,data);
    // if(newuptask?.reminder_at === data.reminder_at){
    //     return newuptask

    // }
    // return newuptask;
    //check if the updated tasks reminder date and edited reminder_date are actually different or not 
    const reminder_changed = data.reminder_at && data.reminder_at !== uptask.reminder_at;
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
    const newupdatetask = update(id,updateData);
    return newupdatetask;
}

async function deleteTask(id:string,reqid:string){
    const tsktodel = await findById(id);
    if (!tsktodel){
        throw {status:404,message:'task doesnot exists'}
    }
    if (tsktodel.owner_id !== reqid){
        throw {status:403,message:'not their task'}
    }
    const deltask = await remove(id);
    return deltask;
}



// export {createTask,deleteTask,updateTask,getTaskById,getTasksByOwner}

// export {createTask}

export {deleteTask,updateTask,createTask,getTasksByOwner,getTaskById}