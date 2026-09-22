import {User} from "../db/models/index";
import { Sequelize } from "sequelize";

async function findByEmail(email:string){
    return User.findOne({where:{email}});
    // const [result] = await Sequelize.query({})
}

async function findById(id:string){
    return User.findByPk(id);
}

async function createUser(data:{
    name:string;
    email:string;
    password_hash:string;
}){
    return User.create(data);
}
export {findByEmail,createUser,findById}