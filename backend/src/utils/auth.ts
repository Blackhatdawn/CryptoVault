import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// In-memory database (replace with real DB in production)
const users: { [key: string]: any } = {};
const tokens: { [key: string]: any } = {};

export const generateTokens = (userId: string) => {
  const secret = (process.env.JWT_SECRET || 'your_secret_key') as string;
  const refreshSecret = (process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key') as string;

  const access_token = jwt.sign(
    { userId },
    secret,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const refresh_token = jwt.sign(
    { userId },
    refreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );

  return { access_token, refresh_token };
};

export const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};

export const comparePassword = (password: string, hash: string) => {
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
  return users[userId];
};

export const getUserByEmail = (email: string) => {
  return Object.values(users).find((u: any) => u.email === email);
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

export const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};

export const comparePassword = (password: string, hash: string) => {
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
  return users[userId];
};

export const getUserByEmail = (email: string) => {
  return Object.values(users).find((u: any) => u.email === email);
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
