import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';
import { UsersCollection } from '../db/models/users.js';
import { SessionsCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/constants.js';

export const registerUser = async (userData) => {
  const user = await UsersCollection.findOne({
    email: userData.email,
  });
  if (user) throw createHttpError(409, 'Email in use');
  const encryptedPassword = await bcrypt.hash(userData.password, 10);
  return await UsersCollection.create({
    ...userData,
    password: encryptedPassword,
  });
};

export const loginUser = async (userData) => {
  const user = await UsersCollection.findOne({ email: userData.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const isEqualPassword = await bcrypt.compare(
    userData.password,
    user.password,
  );
  if (!isEqualPassword) {
    throw createHttpError(401, 'Unauthorized! Incorrect password');
  }
  await SessionsCollection.deleteOne({ userId: user._id });
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });
};

// const createSession = () => {
//   const accessToken = randomBytes(30).toString('base64');
//   const refreshToken = randomBytes(30).toString('base64');
//   return {
//     accessToken,
//     refreshToken,
//     accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
//     refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
//   };
// };
// export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
//   const session = await SessionsCollection.findOne({
//     _id: sessionId,
//     refreshToken,
//   });
//   if (!session) {
//     throw createHttpError(401, 'Session not found');
//   }
//   const isSessionTokenExpired =
//     new Date() > new Date(session.refreshTokenValidUntil);
//   if (isSessionTokenExpired) {
//     throw createHttpError(401, 'Session token expired');
//   }
//   const newSession = createSession();
//   await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });
//   return await SessionsCollection.create({
//     userId: session.userId,
//     ...newSession,
//   });
// };

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};
