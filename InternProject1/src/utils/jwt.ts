import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET as string;

function signInToken(payload: object): string {
  return jwt.sign(payload, jwtSecret, { expiresIn: '10m' });
}

function verifyToken(token: string) {
  return jwt.verify(token, jwtSecret);
}

export { signInToken, verifyToken };