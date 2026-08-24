import { Message, User } from "../models";

async function createMessage(task_id:string,sender_id:string,body:string){
    // return Message.create({task_id,sender_id,body})
    const message = await Message.create({ task_id, sender_id, body });
    return Message.findByPk(message.id,{
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email'] }]
    })
}

async function findByTask(task_id:string,page:number,limit:number){
const offset = (page - 1) * limit;

  return Message.findAndCountAll({
    where: { task_id },
    limit,
    offset,
    order: [["created_at", "ASC"]],
    include:[
      {
        model:User,
        as:'sender',
        attributes:['id','name','email']
      }
    ],
  });
}

export {createMessage,findByTask}