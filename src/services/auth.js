import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import handlebars from 'handlebars';
import fs from 'node:fs/promises';
import { UsersCollection } from '../db/models/users.js';
import { SessionsCollection } from '../db/models/session.js';
import { createSession } from '../utils/createSession.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendMail.js';
import { SMTP, TEMPLATES_DIR } from '../constants/constants.js';

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
  const session = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...session,
  });
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }
  const newSession = createSession();
  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });
  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env('JWT_SECRET'),

    {
      expiresIn: '5m',
    },
  );
  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();
  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });
  try {
    await sendEmail({
      from: env(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (error) {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
      {
        detail: error.message,
      },
    );
  }
};
export const resetPassword = async (password, token) => {
  try {
    const decoded = jwt.verify(token, env('JWT_SECRET'));
    const user = await UsersCollection.findOne({
      _id: decoded.sub,
      email: decoded.email,
    });
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }
    const hashedNewPassword = await bcrypt.hash(password, 10);
    await UsersCollection.findByIdAndUpdate(user._id, {
      password: hashedNewPassword,
    });
    await SessionsCollection.deleteOne({ userId: user._id });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      throw createHttpError(401, 'Token is expired or invalid.');
    }
  }
};
