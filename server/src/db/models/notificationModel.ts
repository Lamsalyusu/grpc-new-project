import { Model, DataTypes } from "sequelize";
import  sequelize  from "../config/db";

class notification extends Model {
  declare id: string;
  declare user_id: string;
  declare type: string;
  declare payload: object
  declare read_at: Date | null;
}

notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: DataTypes.DATE,
    updated_at:DataTypes.DATE,
  },
    {
        sequelize,
        modelName: "Notification",
        tableName: "notifications",
        timestamps:true,
        createdAt:'created_at',
        updatedAt:'updated_at',
        underscored:true
    }
);
export default notification;