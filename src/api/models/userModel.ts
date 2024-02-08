import mongoose from 'mongoose';
import {User} from '../../types/DBTypes';

// TODO: mongoose schema for user
const userSchema = new mongoose.Schema({
  user_name: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user'],
    default: 'user',
  },
  password: {type: String, required: true},
});

export const userModel = mongoose.model<User>('User', userSchema);
