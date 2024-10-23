import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { loginUserSchema, registerUserSchema } from '../validation/auth.js';
import {
  loginUserController,
  registerUserController,
} from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
const router = Router();
router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);
export default router;
router.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);
