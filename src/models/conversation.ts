import mongoose from 'mongoose';
import { Conversation } from '../interfaces/interfaces';

export const conversationSchema: mongoose.Schema<Conversation> =
  new mongoose.Schema(
    {
      participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] },
      ],
      messages: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: [] },
      ],
      lastMessage: {
        _id: { type: mongoose.Schema.Types.ObjectId },
        sender: { type: mongoose.Schema.Types.ObjectId },
        receiver: { type: mongoose.Schema.Types.ObjectId },
        content: { type: String },
      },
    },
    { timestamps: true }
  );

const Conversation = mongoose.model<Conversation & mongoose.Document>(
  'Conversation',
  conversationSchema
);

export default Conversation;
