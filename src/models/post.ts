import mongoose from 'mongoose';
import { Post } from '../interfaces/interfaces';

const postSchema: mongoose.Schema<Post> = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
    },
    contentUpdated: {
      type: Date,
    },
    photos: [{ type: String, default: [] }],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model<Post & mongoose.Document>('Post', postSchema);

export default Post;
