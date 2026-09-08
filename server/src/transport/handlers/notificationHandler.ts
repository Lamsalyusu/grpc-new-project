import grpc from '@grpc/grpc-js';
import { createNotification,markNotificationAsRead, getNotificationsByUser, countUnreadNotifications } from '../../service/notificationService';

function getUserFromCall(call: any) {
  const raw = call.metadata.get('user')[0] as string;
  return JSON.parse(raw);

}
const notificationHandlers = {
  CreateNotifications: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      // const { user_id, page, limit, unread_only } = call.request;
      const { page ,limit , unread_only} = call.request;
      // const result = await getNotificationsByUser(user_id, page, limit, unread_only);
      const result = await createNotification(user.id, page, limit, unread_only);
      callback(null, { count: result.count, notifications: result.rows });
    } catch (err: any) {
      callback(
        { 
            code: grpc.status.INTERNAL, message: err.message || 'Create notifications failed' 
        });
    }
  },

  MarkAsRead: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      // const { id, user_id } = call.request;
      const { id } = call.request;
      // await markNotificationAsRead(id, user_id);
      await markNotificationAsRead(id,user.id);
      callback(null, { message: 'Notification marked as read successfully' });
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: err.message || 'Mark as read failed' });
    }
  },
  

  GetNotificationByUser: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      // const { user_id } = call.request;
      // const result = await getNotificationsByUser(user_id, 1, 10, false);
      const result = await getNotificationsByUser(user.id, 1, 10, false);
      callback(null, { notifications: result.rows });
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: err.message || 'Get notifications by user failed' });
    }
  },
  

  GetUnreadCount: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      const count = await countUnreadNotifications(user.id);
      callback(null, { count });
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: err.message || 'Get unread count failed' });
    }
  },
};

export default notificationHandlers;