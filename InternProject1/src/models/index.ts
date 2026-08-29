import  sequelize  from "../config/db";
import User from "./userModel";
import Task from "./taskModel";
import TaskCollaborator from "./taskCollaboratorModel";
import Message from "./messageModel";
import Notification from "./notificationModel";
// models/index.ts
User.hasMany(Message, { foreignKey: "sender_id", as: "sentMessages" });
Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
Task.hasMany(TaskCollaborator, { foreignKey: "task_id" });
TaskCollaborator.belongsTo(Task, { foreignKey: "task_id" });
TaskCollaborator.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
export {sequelize,User,Task,TaskCollaborator,Notification,Message}