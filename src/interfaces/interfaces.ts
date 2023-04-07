import mongoose from 'mongoose';

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  profilePictureUrl: string;
  acquaintances: mongoose.Types.ObjectId[] | User[];
  posts: mongoose.Types.ObjectId[] | Post[];
  likedPosts: mongoose.Types.ObjectId[] | Post[];
  messages: mongoose.Types.ObjectId[] | Message[];
}

export interface Post {
  _id: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  comments: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
}

export interface Message {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId | User;
  receiver: mongoose.Types.ObjectId | User;
  content: string;
  createdAt: Date;
}
