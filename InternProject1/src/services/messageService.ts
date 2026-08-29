import { findById as findTaskById } from "../repositories/taskRepository";
import { findOne as findCollaborator } from "../repositories/taskCollaboratorRepository";
import { createMessage, findByTask } from "../repositories/messageRepository";


//yo function chai if owner and collborator lai access cha ki nai bhanne ko lagi 
async function checkAccess(task_id:string,user_id:string){
    // console.log("CHECKING ACCESS:", { task_id, user_id });
    const task = await findTaskById(task_id);
    //  console.log("TASK FOUND:", task ? { id: task.id, owner_id: task.owner_id } : null);
    if(!task){
        throw { status :404 ,message:'task not found'}
    }
    // yo condition ma chai task ko owner ho bhanne bujhinchha
    const owner = task.owner_id === user_id;
    // yo condition le chai aba collaborator ho ki nai bhanera check hunchha
    const iscollaborator = await findCollaborator(task_id,user_id);
    // if no owner and collaborator then no access to chat
    if(!owner && !iscollaborator){
        throw { status :403 ,message: 'not authorized to access the chat'}
    }
    return true;

}

// yo function chai message sending ko lagi 
async function sendMessage(task_id:string,sender_id:string,body:string){
    // yahan check hunxa yo taks ko access chha ki nai bhanera ani mathi ko condition ma check hunxa yo function bata
    await checkAccess(task_id,sender_id);
    // if access chha bhane yahan bata message create bhayo --> message garna milyo 
    const message = await createMessage(task_id,sender_id,body)
    return message;
}

async function getMessage(task_id:string,requesterId:string,page:number,limit:number){
    await checkAccess(task_id,requesterId);
    const message = await findByTask(task_id,page,limit);
    return message;
}
export {sendMessage,getMessage,checkAccess}