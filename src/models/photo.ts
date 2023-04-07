import mongoose from 'mongoose';
import { Photo } from '../interfaces/interfaces';

const photoSchema: mongoose.Schema<Photo> = new mongoose.Schema(
  {
    url: { type: String },
  },
  { timestamps: true }
);

const Photo = mongoose.model<Photo & mongoose.Document>('Photo', photoSchema);

export default Photo;
