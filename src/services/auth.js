import bcrypt from 'bcrypt';
import { UsersCollection } from '../db/models/users.js';
import createHttpError from 'http-errors';

export const registerUser = async (userData) => {
  const duplicatedEmail = await UsersCollection.findOne({
    email: userData.email,
  });
  if (duplicatedEmail) throw createHttpError(409, 'Email in use');
  const encryptedPassword = await bcrypt.hash(userData.password, 10);
  return await UsersCollection.create({
    ...userData,
    password: encryptedPassword,
  });
};
