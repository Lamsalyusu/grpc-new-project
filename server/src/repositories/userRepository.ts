import { User } from "../db/models/index";
// import { Sequelize } from "sequelize";
import sequelize from "../db/connection";
import { QueryTypes } from "sequelize";
import user from "../db/models/userModel";


type userRow = {
  id:string,
  name :string,
  email:string,
  password_hash:string,
  role:string

}

async function findByEmail(email: string) {
  const users = await sequelize.query<userRow>(
    // the function of :email is to prevent SQL injection attacks 
    // :email is a placeholder for the email parameter that will be passed in the replacements object
    "SELECT * FROM users where email = ? LIMIT 1",
    {
      replacements: [email],
      // QueryTypes.SELECT is used to specify that the query is a SELECT query and the result will be an array of objects
      // by default sequelize.query() returns a complex array with two elements [results,metadata]
      // but using QueryTypes.SELECT will return only the results array
      type: QueryTypes.SELECT
    }
  );
  console.log("yo chai repo ko la ",users[0])
  // user variable will always be an array eg [{id:1,name:"John",email:"}]
  // since emails are unique in the database, we can return the first element of the array or null if the array is empty
  return users[0]||null;
}

async function findById(id: string) {
  // return User.findByPk(id);
  const users = await sequelize.query<userRow>(
    "SELECT * FROM users where id = ?",
    {
      replacements: [id],
      type: QueryTypes.SELECT
    }
  );
  return users[0]||null;
}

async function createUser(data: {
  name: string;
  email: string;
  password_hash: string;
}) {
  return User.create(data);
}
export { findByEmail, createUser, findById };
