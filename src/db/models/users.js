// Створіть модель User з такими полями:

import { model, Schema } from 'mongoose';

// email - string, email, unique, required

const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);
usersSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};
export const UsersCollection = model('Users', usersSchema);
