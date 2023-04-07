import mongoose from 'mongoose';
import { User } from '../interfaces/interfaces';

const userSchema: mongoose.Schema<User> = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePictureUrl: {
      type: String,
      default: '',
    },
    photos: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', default: [] },
    ],
    createdAt: {
      type: Date,
      default: new Date(),
    },
    acquaintances: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] },
    ],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: [] }],
    likedPosts: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: [] },
    ],
    messages: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: [] },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model<User & mongoose.Document>('User', userSchema);

export default User;
