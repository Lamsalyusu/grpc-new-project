import {QueryTypes} from "sequelize";
import { Notification } from "../db/models";
import sequelize from "../db/connection";
import {v4 as uuidv4} from "uuid";

//yo chai notification create garna ko lagi
async function create(user_id: string, type: string, payload: object) {
  // return Notification.create({ user_id, type, payload });
  // the use of uuid here is that using ORM function directly internally creates a new uuid but using RAW SQL QUERY we need to create a new uuid and pass it to the query.
  const id = uuidv4();
  const notification = await sequelize.query(
    "INSERT INTO notifications (id,user_id,type,payload,created_at,updated_at) VALUES (:id,:user_id,:type,:payload,NOW(),NOW())",
    {
      replacements: { id, user_id, type, payload:JSON.stringify(payload)},
      type: QueryTypes.INSERT,
    }
  );
  return notification;
}

async function findByUser( user_id: string,page: number,limit: number,unreadOnly: boolean = false) {
  const where: any = { user_id };
  if (unreadOnly) {
    where.read_at = null;
  }
  return Notification.findAndCountAll({
    where,
    limit,
    offset: (page - 1) * limit,
    order: [["created_at", "DESC"]],
  });
}

async function markAsRead(notification_id: string, user_id: string) {
  // const notification = await Notification.findOne({
  //   where: {
  //     id: notification_id,
  //     user_id,
  //   },
  // });
  const notification = await sequelize.query(
    "SELECT * FROM notifications WHERE id = :notification_id AND user_id = :user_id",
    {
      replacements:{ notification_id, user_id },
      type:QueryTypes.SELECT
    }
  )

  if (notification.length === 0){
    throw { status: 404, message: "Notification not found" };
  }
  const notificationData:any = notification[0];

  if (notificationData.read_at) {
    return notificationData;
  }
  await sequelize.query(
    "UPDATE notifications SET read_at = NOW() WHERE id = :notification_id AND user_id = :user_id",
    {
      replacements:{notification_id, user_id},
      type:QueryTypes.UPDATE,
    }
  )
  notificationData.read_at = new Date();
  return notificationData;
}

//   if (!notification) {
//     throw { status: 404, message: "Notification not found" };
//   }
//   if (notification.read_at) {
//     return notification;
//   }
//   notification.read_at = new Date();
//   await notification.save();
//   return notification;
// }

async function countUnread(user_id: string) {
  // return Notification.count({ where: { user_id, read_at: null } });
  const unread = await sequelize.query(
    "SELECT COUNT(*) AS count FROM notifications WHERE user_id = :user_id AND read_at IS NULL",
    {
      replacements: { user_id },
      type: QueryTypes.SELECT,
    }
  );
  return (unread[0] as any).count;
}

export { create, findByUser, markAsRead, countUnread };
