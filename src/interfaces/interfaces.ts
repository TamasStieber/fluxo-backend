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
  photos: Photo[];
  createdAt: Date;
  profilePictureUrl: string;
  lastReadMessages: LastReadMessage[];
  acquaintances: mongoose.Types.ObjectId[] | User[];
  // posts: mongoose.Types.ObjectId[] | Post[];
  posts: mongoose.Types.Array<mongoose.Types.ObjectId>;
  // likedPosts: mongoose.Types.ObjectId[] | Post[];
  likedPosts: mongoose.Types.Array<mongoose.Types.ObjectId>;
  messages: mongoose.Types.ObjectId[] | Message[];
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
