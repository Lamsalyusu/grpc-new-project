// import notification from "../models/notificationModel";
import {create,findByUser,markAsRead,countUnread} from "../repositories/notificationRepository";
async function createNotification(user_id:string,type:string,payload:object){
    return create(user_id,type,payload);
}

async function markNotificationAsRead(notification_id:string,user_id:string){
    return markAsRead(notification_id, user_id);
}

async function getNotificationsByUser(user_id:string,page:number,limit:number,unreadOnly:boolean=false){
    return findByUser(user_id, page, limit, unreadOnly);
}

async function countUnreadNotifications(user_id:string){
    return countUnread(user_id);
}



export { createNotification, markNotificationAsRead, getNotificationsByUser, countUnreadNotifications };