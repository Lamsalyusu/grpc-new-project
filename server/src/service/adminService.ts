import bcrypt from "bcrypt";
import { findAdminById,createAdmin, findAdminByEmail } from "../repositories/adminRepository";
import { signInToken } from "../utils/jwt";
import { RegisterInput,LoginInput } from "../validators/authValidator";
import { findAllUsers ,findById,deleteUsers} from "../repositories/userRepository";

async function registerAdmin(data:RegisterInput){
    const existingAdmin = await findAdminByEmail(data.email);
    if (existingAdmin){
        throw {message:"Email already in use"}
    }
    const password_hash = await bcrypt.hash(data.password, 10);
    const admin = await createAdmin({
        name:data.name,
        email:data.email,
        password_hash

    })
    return {
        admin:{id:admin.id,name:admin.name,email:admin.email}
    }
}

async function loginAdmin(data: LoginInput) {
  const admin = await findAdminByEmail(data.email);

  if (!admin) {
    throw { message: "Invalid email or password" };
  }

  const passwordMatch = await bcrypt.compare(
    data.password,
    admin.password_hash
  );

  if (!passwordMatch) {
    throw { message: "Invalid email or password" };
  }

  const token = signInToken({
    id: admin.id,
    email: admin.email,
    role:"admin"
  });

  return { 
    admin: {id: admin.id,name: admin.name,email: admin.email},
    token
  };
}
// ====================================================================================
async function seeAllUsers(){
  const users = await findAllUsers()
  return {
    users:users.map((user)=>({
      id:user.id,
      name:user.name,
      email:user.email 
      
    }))
  }
}

// ======================================================================================
async function seeUser(user_id:string){
  const user = await findById(user_id)
  if(!user){
    throw {message:"User not found"}
  }

  return {
    id:user.id,
    name:user.name,
    email:user.email
  }
}

// =======================================================================================

async function deleteUser(user_id: string) {
  const user = await deleteUsers(user_id);

  if (!user) {
    throw { message: "User not found" };
  }

  return {
    message: "User deleted successfully"
  };
}


export {registerAdmin,loginAdmin,seeAllUsers,seeUser,deleteUser};