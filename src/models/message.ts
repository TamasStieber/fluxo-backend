import mongoose from 'mongoose';
import { Message } from '../interfaces/interfaces';

export const messageSchema: mongoose.Schema<Message> = new mongoose.Schema(
  {
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
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model<Message & mongoose.Document>(
  'Message',
  messageSchema
);

export default Message;
