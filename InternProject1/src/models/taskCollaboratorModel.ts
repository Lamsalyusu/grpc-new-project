import { Model,DataTypes } from "sequelize";
import sequelize from '../config/db';

class taskCollaborator extends Model{
  declare task_id:string;
  declare user_id:string;

}
taskCollaborator.init(
    {
      task_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },

    created_at: DataTypes.DATE,

    },

    {
    sequelize,
    modelName: "taskCollaborator",
    tableName: "task_collaborators",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true
    }

);
export default taskCollaborator;