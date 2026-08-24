import { Model,DataTypes } from "sequelize";
import  sequelize  from "../config/db";
class messages extends Model{
  declare id: string;
  declare task_id: string;
  declare sender_id: string;
  declare body: string;
}
messages.init(
    {
      id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at:DataTypes.DATE
  },
  
  {
    sequelize,
    modelName: "Message",
    tableName: "messages",
    timestamps:true,
    createdAt:"created_at",
    updatedAt:'updated_at',
    underscored:true


    }
)
export default messages;