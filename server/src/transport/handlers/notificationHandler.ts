import grpc from '@grpc/grpc-js';
import { markNotificationAsRead, getNotificationsByUser, countUnreadNotifications } from '../../service/notificationService';

const notificationHandlers = {
  GetNotifications: async (call: any, callback: any) => {
    try {
      const { user_id, page, limit, unread_only } = call.request;
      const result = await getNotificationsByUser(user_id, page, limit, unread_only);
      callback(null, { count: result.count, notifications: result.rows });
    } catch (err: any) {
      callback(
        { 
            code: grpc.status.INTERNAL, message: err.message || 'Get notifications failed' 
        });
    }
  },

  MarkAsRead: async (call: any, callback: any) => {
    try {
      const { id, user_id } = call.request;
      await markNotificationAsRead(id, user_id);
      callback(null, { message: 'Notification marked as read successfully' });
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: err.message || 'Mark as read failed' });
    }
  },

  GetUnreadCount: async (call: any, callback: any) => {
    try {
      const { user_id } = call.request;
      const count = await countUnreadNotifications(user_id);
      callback(null, { count });
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: err.message || 'Get unread count failed' });
    }
  },
};

export default notificationHandlers;