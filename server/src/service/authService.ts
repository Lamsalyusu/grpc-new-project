import bcrypt from "bcrypt";
import { findByEmail, createUser } from "../repositories/userRepository";
import { signInToken } from "../utils/jwt";
import { RegisterInput, LoginInput } from "../validators/authValidator";

async function registerUser(data:RegisterInput) {
  const existingUser = await findByEmail(data.email);
  if (existingUser) {
    throw { message: "Email already in use" };
  }
  const password_hash = await bcrypt.hash(data.password,10);
  const user = await createUser({
    name: data.name,
    email: data.email,
    password_hash,
  });
  // const token = signInToken({ id: user.id, email: user.email });
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
    // token,
  };
} 

async function loginUser(data: LoginInput) {
  const user = await findByEmail(data.email);
  // console.log(user)

  if (!user) {
    throw { message: "No user found (try registering first) " };
  }
  const isMatch = await bcrypt.compare(data.password, user.password_hash);
  if (!isMatch) {
    throw { message: "Invalid email or password" };
  }
  // const existingUser = await findByEmail(data.email);
  // if(!existing)

  const token = signInToken({ id: user.id, email: user.email });
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

export {registerUser,loginUser}