import {Admin} from "../db/models/index"
import sequelize from "../db/connection";
import { QueryTypes } from "sequelize";


type adminRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
};
// =======================================================================================================================================================================================
async function findAdminByEmail(email: string) {
  const admins = await sequelize.query<adminRow>(
    "SELECT * FROM admins WHERE email = ? LIMIT 1",
    {
      replacements: [email],
      type: QueryTypes.SELECT
    }
  );

  return admins[0] || null;
}

// =======================================================================================================================================================================================
async function findAdminById(id: string) {
  const admins = await sequelize.query<adminRow>(
    "SELECT * FROM admins WHERE id = ? LIMIT 1",
    {
      replacements: [id],
      type: QueryTypes.SELECT
    }
  );

  return admins[0] || null;
}

// =======================================================================================================================================================================================
async function createAdmin(data: {
  name: string;
  email: string;
  password_hash: string;
}) {
  return Admin.create(data);
}

// =========================================================================================================================================================================================
export {
  findAdminByEmail,
  findAdminById,
  createAdmin
};