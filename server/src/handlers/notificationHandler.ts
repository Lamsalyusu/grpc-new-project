// import grpc from '@grpc/grpc-js';
// import { createNotification,markNotificationAsRead, getNotificationsByUser, countUnreadNotifications } from '../../service/notificationService';

// function getUserFromCall(call: any) {
//   const raw = call.metadata.get('user')[0] as string;
//   return JSON.parse(raw);

// }
// const notificationHandlers = {
//   CreateNotifications: async (call: any, callback: any) => {
//     try {
//       const user = getUserFromCall(call);
//       // const { user_id, page, limit, unread_only } = call.request;
//       const { type, payload } = call.request;
//       // const result = await getNotificationsByUser(user_id, page, limit, unread_only);
//       const result = await createNotification(user.id, type, payload);
// callback(null, {
//         notification: {
//           id: result.id,
//           user_id: result.user_id,
//           type: result.type,
//           payload: JSON.stringify(result.payload ?? {}),
//           read_at: result.read_at
//             ? result.read_at.toISOString()
//             : '',
//           created_at: result.created_at
//             ? result.created_at.toISOString()
//             : ''
//         }
//       });  } catch (err: any) {
//       callback(
//         { 
//             code: grpc.status.INTERNAL, message: err.message || 'Create notifications failed' 
//         });
//     }
//   },

//   MarkAsRead: async (call: any, callback: any) => {
//     try {
//       const user = getUserFromCall(call);
//       // const { id, user_id } = call.request;
//       const { id } = call.request;
//       // await markNotificationAsRead(id, user_id);
//       await markNotificationAsRead(id,user.id);
//       callback(null, { message: 'Notification marked as read successfully' });
//     } catch (err: any) {
//       callback({ code: grpc.status.INTERNAL, message: err.message || 'Mark as read failed' });
//     }
//   },
  

//   GetNotificationByUser: async (call: any, callback: any) => {
//     try {
//       const user = getUserFromCall(call);
//       // const { user_id } = call.request;
//       // const result = await getNotificationsByUser(user_id, 1, 10, false);
//       const result = await getNotificationsByUser(user.id, 1, 10, false);
//       callback(null, { notifications: result.rows });
//     } catch (err: any) {
//       callback({ code: grpc.status.INTERNAL, message: err.message || 'Get notifications by user failed' });
//     }
//   },
  

//   GetUnreadCount: async (call: any, callback: any) => {
//     try {
//       const user = getUserFromCall(call);
//       const count = await countUnreadNotifications(user.id);
//       callback(null, { count });
//     } catch (err: any) {
//       callback({ code: grpc.status.INTERNAL, message: err.message || 'Get unread count failed' });
//     }
//   },
// };

// export default notificationHandlers;


import * as grpc from '@grpc/grpc-js';
import { createNotification,markNotificationAsRead,getNotificationsByUser,countUnreadNotifications } from '../service/notificationService';
import logger from '../utils/logger';

function getUserFromCall(call: any) {
  const raw = call.metadata.get('user')[0] as string;
  return JSON.parse(raw);
}

const notificationHandlers = {
  CreateNotification: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      const {type,payload} = call.request;
      const parsedPayload = payload? JSON.parse(payload): {};
      const result = await createNotification( user.id,type,parsedPayload );
      logger.info("notification created succesfully")
      callback(null, {
        notification: {
          id: result.id,
          user_id: result.user_id,
          type: result.type,
          payload: JSON.stringify(result.payload ?? {}),
          read_at: result.read_at? result.read_at.toISOString(): '',
          created_at: result.created_at ? result.created_at.toISOString() : ''
        }
      });

    } catch (err: any) {
      logger.error(`creating notification failed ${err.message}`)
      // console.error("Create notification error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || 'Create notification failed'
      });
    }
  },


  GetNotificationByUser: async (call: any, callback: any) => {
    try { 
      const user = getUserFromCall(call);
      const { page = 1,limit = 10,unread_only = false } = call.request;
      const result = await getNotificationsByUser(user.id,page,limit,unread_only);

      const notifications = result.rows.map((notification: any) => ({
        id: notification.id,
        user_id: notification.user_id,
        type: notification.type,
        payload: JSON.stringify(notification.payload ?? {}),
        read_at: notification.read_at ? notification.read_at.toISOString(): '',
        created_at: notification.created_at ? notification.created_at.toISOString(): ''
      }));
      logger.info("notification loaded for each users ")
      callback(null, { count: result.count, notifications });
    } 
    catch (err: any) {
      logger.error(`getting notification failed ${err.message}`)
      console.error("Get notifications error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || 'Get notifications failed'
      });
    }
  },

  MarkAsRead: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      const { id } = call.request;
      await markNotificationAsRead(id,user.id);
      logger.info("notification marked as read")
      callback(null, {
        message: 'Notification marked as read successfully'
      });
    } 
    catch (err: any) {
      logger.error(`making as read failed ${err.message}`)
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || 'Mark as read failed'
      });
    }
  },

  GetUnreadCount: async (call: any, callback: any) => {
    try {
      const user = getUserFromCall(call);
      const count = await countUnreadNotifications(user.id);
      logger.info("Unread notifications fetched successfully")
      callback(null, { count });
    } catch (err: any) {
      logger.error(`unread notification fetch failed ${err.message}`)
      callback({
        code: grpc.status.INTERNAL,
        message: err.message || 'Get unread count failed'
      });
    }
  }
};


export default notificationHandlers;