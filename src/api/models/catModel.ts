import mongoose from 'mongoose';
import {Cat} from '../../types/DBTypes';

// TODO: mongoose schema for cat
const catSchema = new mongoose.Schema({
  cat_name: {type: String, required: true},
  weight: {type: Number, required: true},
  filename: {type: String, required: true},
  birthdate: {type: String, required: true},
  location: {
    type: {type: String, enum: ['Point'], required: true},
    coordinates: {type: [Number], required: true},
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export const catModel = mongoose.model<Cat>('Cat', catSchema);
