
import notification from "../models/notificationModel";

//yo chai notification create garna ko lagi 
async function create(user_id:string,type:string,payload:object){
    return notification.create({user_id,type,payload});
}
async function findByUser(user_id:string,page:number,limit:number,unreadOnly:boolean=false){
    const where: any = {user_id};
    if (unreadOnly) {
        where.read_at = null;
    }
    return notification.findAndCountAll({
        where,
        limit,
        offset: (page - 1) * limit,
        order: [['created_at', 'DESC']] 
    });
}


async function markAsRead(notification_id: string, user_id: string) {

    const notif = await notification.findOne({
        where: {
            id: notification_id,
            user_id,
        },
    });

    if (!notif) {
        throw {status :404,message:'Notification not found'};
    }

    if (notif.read_at) {
        return notif;
    }

    notif.read_at = new Date();

    await notif.save();

    return notif;
}

async function countUnread(user_id:string) {
    return notification.count({where: {user_id, read_at: null}});
}


export { create, findByUser, markAsRead, countUnread };