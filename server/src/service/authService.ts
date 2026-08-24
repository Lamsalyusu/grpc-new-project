import bcrypt from "bcrypt";
import { findByEmail, createUser } from "../repositories/userRepository";
import { signInToken } from "../utils/jwt";
import { RegisterInput, LoginInput } from "../validators/authValidator";

async function registerUser(data: RegisterInput) {
  const existingUser = await findByEmail(data.email);
  if (existingUser) {
    throw { status: 409, message: "Email already in use" };
  }
  const password_hash = await bcrypt.hash(data.password,10);
  const user = await createUser({
    name: data.name,
    email: data.email,
    password_hash,
  }) as any;
  const token = signInToken({ id: user.id, email: user.email });
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
    // token,
  };
}

async function loginUser(data: LoginInput) {
  const user = await findByEmail(data.email);

  if (!user) {
    throw { status: 401, message: "Invalid email or password" };
  }
  const isMatch = await bcrypt.compare(data.password, user.password_hash);
  if (!isMatch) {
    throw { status: 401, message: "Invalid email or password" };
  }
  const token = signInToken({ id: user.id, email: user.email });
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

export {registerUser,loginUser}