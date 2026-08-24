import {Sequelize as _Sequelize ,DataTypes,Model} from "sequelize"
import sequelize  from "../config/db"
class user extends Model{
  declare id: string;
  declare name: string;
  declare email: string;
  declare password_hash: string;
  declare role: string;
}

user.init(
    {
      id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },
    // created_at: DataTypes.DATE,
    // updated_at: DataTypes.DATE,
},

    {
        sequelize,
        modelName:"user",
        tableName:"users",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        underscored: true,

    }

);
export default user;
