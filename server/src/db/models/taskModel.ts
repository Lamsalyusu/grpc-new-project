
import { Model,DataTypes } from "sequelize";
import sequelize from "../config/db";
class task extends Model{
  declare id: string;
  declare owner_id: string;
  declare title: string;
  declare description: string;
  declare status: string;
  declare priority: string;
  declare due_date: Date;
  declare reminder_at: Date;
  declare reminder_status: string;
}

task.init(
    {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },

    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "medium",
    },

    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    reminder_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    reminder_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },

    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    },

    {
        sequelize,
        modelName:"task",
        tableName:"tasks",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        underscored: true
    }

);
export default task;
