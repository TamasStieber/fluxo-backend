import { Request } from 'express';
import mongoose, { Document } from 'mongoose';

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  fullName: string;
  userName: string;
  email: string;
  password: string;
  photosFolder: string;
  photos: Photo[];
  createdAt: Date;
  profilePictureUrl: string;
  friendRequests: mongoose.Types.ObjectId[];
  lastReadMessages: LastReadMessage[];
  acquaintances: mongoose.Types.ObjectId[] | User[];
  // posts: mongoose.Types.ObjectId[] | Post[];
  posts: mongoose.Types.Array<mongoose.Types.ObjectId>;
  // likedPosts: mongoose.Types.ObjectId[] | Post[];
  likedPosts: mongoose.Types.Array<mongoose.Types.ObjectId>;
}

export interface Photo {
  url: string;
}

export interface Post {
  _id: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  contentUpdated: Date;
  comments: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
}

export interface Message {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  participants: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  lastMessage: Message;
}

export interface LastReadMessage {
  conversation: mongoose.Types.ObjectId;
  lastReadMessage: mongoose.Types.ObjectId;
}

export interface FriendRequest {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}
