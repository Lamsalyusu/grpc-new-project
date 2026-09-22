import { DataTypes,Model } from "sequelize";
import sequelize from "../connection";
// import { UUID } from "node:crypto";
class collaboration_request extends Model{
    declare id:string;
    declare sender_id:string;
    declare receiver_id:string;
    declare status:string;
    // declare role:string;
}
collaboration_request.init(
    {
        id:{
            type:DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4,
            primaryKey:true,
            allowNull:false
        },
        
        sender_id:{
            type:DataTypes.UUID,
            // defaultValue:DataTypes.UUIDV4,
            allowNull:false
        },
        
        receiver_id:{
            type:DataTypes.UUID,
            // defaultValue:DataTypes.UUIDV4
            allowNull:false
        },
        
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "pending",
        },
    },
    {
        sequelize,
        modelName:'collaboration_request',
        tableName:'collaboration_requests',
        timestamps:true,
        createdAt:"created_at",
        updatedAt:"updated_at",
        underscored:true
    }
)
export default collaboration_request;