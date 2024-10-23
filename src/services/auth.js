import { User } from '../db/models/user.js';

export const registerUser = (userData) => User.create(userData);
