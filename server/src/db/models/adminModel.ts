import {DataTypes, Model} from 'sequelize';
import sequelize from '../connection';
class Admin extends Model {
    declare id: string;
    declare name: string;
    declare email: string;
    declare password_hash: string;
    declare created_at: Date;
    declare updated_at: Date;
}
Admin.init(
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
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName:"admin",
        tableName:"admins",
        timestamps:true,
        createdAt:"created_at",
        updatedAt:"updated_at",
        underscored:true,
    }
);
export default Admin;