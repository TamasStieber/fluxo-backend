import mongoose from 'mongoose';
import { FriendRequest } from '../interfaces/interfaces';

export const friendRequestSchema: mongoose.Schema<FriendRequest> =
  new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      required: true,
    },
  });

const FriendRequest = mongoose.model<FriendRequest & mongoose.Document>(
  'FriendRequest',
  friendRequestSchema
);

export default FriendRequest;
