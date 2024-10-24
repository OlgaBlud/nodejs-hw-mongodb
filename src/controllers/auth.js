import { THIRTY_DAYS } from '../constants/constants.js';
import { loginUser, logoutUser, registerUser } from '../services/auth.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};
export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie('sessionID', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};
export const logoutUserController = async (req, res) => {
  const sessionIdCookies = req.cookies.sessionId;
  if (sessionIdCookies) {
    await logoutUser(sessionIdCookies);
  }
  res.clearCookie('sessionID');
  res.clearCookie('refreshToken');
  res.status(204).send();
};
