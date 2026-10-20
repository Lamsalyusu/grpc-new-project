import { User } from "../db/models/index";
// import { Sequelize } from "sequelize";
import sequelize from "../db/connection";
import { QueryTypes } from "sequelize";

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
  // user variable will always be an array eg [{id:1,name:"John",email:"}]
  // since emails are unique in the database, we can return the first element of the array or null if the array is empty
  return users[0]||null;
}

async function findById(id: string) {
  // return User.findByPk(id);
  const users = await sequelize.query<userRow>(
    "SELECT id,name,email FROM users where id = ?",
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


// this one is used by admin for seeing all the users 

async function findAllUsers(){
  const users = await sequelize.query<userRow>(
    "SELECT id,name,email,role FROM users ",
    {
      type:QueryTypes.SELECT
    }

  )
  return users;
}

async function updateUser(user_id: string, data: { name?: string; email?: string; role?: string }) {
  const currentUser = await findById(user_id);

  if (!currentUser) {
    return null;
  }

  const nextName = data.name?.trim() || currentUser.name;
  const nextEmail = data.email?.trim() || currentUser.email;
  const nextRole = data.role || "user";

  await sequelize.query(
    "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
    {
      replacements: [nextName, nextEmail, nextRole, user_id],
      type: QueryTypes.UPDATE,
    },
  );

  return {
    id: user_id,
    name: nextName,
    email: nextEmail,
    role: nextRole,
  };
}

async function deleteUsers(user_id: string) {
  const user = await findById(user_id);

  if (!user) {
    return null;
  }

  await sequelize.query(
    "DELETE FROM users WHERE id = ?",
    {
      replacements: [user_id],
      type: QueryTypes.DELETE
    }
  );

  return user;
}

export { findByEmail, createUser, findById, findAllUsers, updateUser, deleteUsers};
