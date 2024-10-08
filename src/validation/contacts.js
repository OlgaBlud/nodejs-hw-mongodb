import Joi from 'joi';
export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.base': 'Username should be a string',
  }),
  phoneNumber: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().messages({
    'string.base': 'Invalid email',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('work', 'home', 'personal').required(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).messages({
    'string.base': 'Username should be a string',
  }),
  phoneNumber: Joi.string().min(3).max(20),
  email: Joi.string().email().messages({
    'string.base': 'Invalid email',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('work', 'home', 'personal'),
});
