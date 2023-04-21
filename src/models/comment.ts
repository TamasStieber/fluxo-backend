import mongoose from 'mongoose';
import { IComment } from '../interfaces/interfaces';

export const commentSchema: mongoose.Schema<IComment> = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    replies: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: [] },
    ],
    repliesCount: {
      type: Number,
      default: 0,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId || null,
      ref: 'Comment',
      default: null,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model<IComment & mongoose.Document>(
  'Comment',
  commentSchema
);

export default Comment;
