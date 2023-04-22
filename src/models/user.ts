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
    fullName: {
      type: String,
      required: true,
    },
    userName: {
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
    photosFolder: {
      type: String,
      default: '',
    },
    profilePictureUrl: {
      type: String,
      default: '',
    },
    friendRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FriendRequest',
        default: [],
      },
    ],
    lastReadMessages: [
      {
        conversation: { type: mongoose.Schema.Types.ObjectId },
        lastReadMessage: { type: mongoose.Schema.Types.ObjectId },
      },
    ],
    // photos: [
    //   { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', default: [] },
    // ],
    photos: [{ type: String, default: [] }],
    createdAt: {
      type: Date,
    },
    acquaintances: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] },
    ],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: [] }],
    likedPosts: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: [] },
    ],
    comments: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: [] },
    ],
    likedComments: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: [] },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model<User & mongoose.Document>('User', userSchema);

export default User;
