import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// In-memory database (replace with persistent DB in production)
const users: { [key: string]: any } = {};

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
};

const getJwtRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET environment variable is required');
  return secret;
};

export const generateTokens = (userId: string) => {
  const access_token = jwt.sign(
    { userId },
    getJwtSecret(),
    { expiresIn: (process.env.JWT_EXPIRE || '15m') as any }
  );
  const refresh_token = jwt.sign(
    { userId },
    getJwtRefreshSecret(),
    { expiresIn: (process.env.JWT_REFRESH_EXPIRE || '7d') as any }
  );
  return { access_token, refresh_token };
};

export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 12);
};

export const comparePassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};

export const createUser = (email: string, password: string, fullName: string) => {
  const userId = uuidv4();
  const hashedPassword = hashPassword(password);
  users[userId] = {
    id: userId,
    email,
    password: hashedPassword,
    fullName,
    createdAt: new Date(),
    wallet: {
      balance: 0,
      deposits: [],
      withdrawals: [],
    },
  };
  return users[userId];
};

export const getUserById = (userId: string) => {
  return users[userId] || null;
};

export const getUserByEmail = (email: string) => {
  return Object.values(users).find((u: any) => u.email === email) || null;
};

export const getAllUsers = () => {
  return Object.values(users);
};

export const updateUser = (userId: string, updates: any) => {
  if (users[userId]) {
    users[userId] = { ...users[userId], ...updates };
    return users[userId];
  }
  return null;
};
