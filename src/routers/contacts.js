import { Router } from 'express';

import {
  getAllContactsController,
  getContactByIdController,
} from '../controllers/contacts.js';
const router = Router();
router.get('/contacts', getAllContactsController);
router.get('/contacts/:contactId', getContactByIdController);

export default router;
