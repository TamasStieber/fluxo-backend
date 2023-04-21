import { Router } from 'express';
import * as Interfaces from '../interfaces/interfaces';
import Post from '../models/post';
import User from '../models/user';
import mongoose from 'mongoose';
import Comment from '../models/comment';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    Post.find()
      .sort({ createdAt: -1 })
      .populate('author likes')
      .exec()
      .then((posts) => {
        res.status(200).json({ posts });
      })
      .catch(() => {
        next(res.status(500).json({ error: 'Internal server error' }));
      });
  } catch {
    next(res.status(500).json({ error: 'Internal server error' }));
  }
});

router.post('/', async (req, res, next) => {
  const newPost = req.body as Interfaces.Post;

  try {
    const post = await Post.create(newPost);
    await User.findByIdAndUpdate(req.userId, {
      $push: { posts: post._id },
    });

    res.status(201).json({ post });
  } catch {
    next(res.status(500).json({ error: 'Internal server error' }));
  }
});

router.put('/:id', async (req, res) => {
  const update = req.body as Post;
  update.contentUpdated = new Date();

  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    res.status(200).json({ updatedPost });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/add-like', async (req, res, next) => {
  console.log(req.userId);

  try {
    await Post.findByIdAndUpdate(req.params.id, {
      $push: { likes: req.userId },
    });
    await User.findByIdAndUpdate(req.userId, {
      $push: { likedPosts: req.params.id },
    });
    await Post.findById(req.params.id)
      .populate('likes')
      .exec()
      .then((updatedPost) => {
        res.status(200).json(updatedPost?.likes);
      })
      .catch(() => {
        next(res.status(500).json({ error: 'Internal server error' }));
      });
  } catch {
    next(res.status(500).json({ error: 'Internal server error' }));
  }
});

router.put('/:id/remove-like', async (req, res, next) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      $pull: { likes: req.userId },
    });
    await User.findByIdAndUpdate(req.userId, {
      $pull: { likedPosts: req.params.id },
    });
    await Post.findById(req.params.id)
      .populate('likes')
      .exec()
      .then((updatedPost) => {
        res.status(200).json(updatedPost?.likes);
      })
      .catch(() => {
        next(res.status(500).json({ error: 'Internal server error' }));
      });
  } catch {
    next(res.status(500).json({ error: 'Internal server error' }));
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const users = await User.find({ likedPosts: req.params.id });

    if (users) {
      for (const user of users) {
        user.likedPosts.pull(req.params.id);
        await user.save();
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }

  try {
    const postToDelete = await Post.findByIdAndDelete(req.params.id);
    postToDelete?.comments.forEach(async (comment) => {
      await removeComments(comment);
    });
    const author = await User.findById(postToDelete?.author);
    author?.posts.pull(req.params.id);
    author?.save();
    res.status(200).json({ postToDelete });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const removeComments = async (commentId: mongoose.Types.ObjectId) => {
  try {
    const comment = await Comment.findByIdAndDelete(commentId);
    await User.findByIdAndUpdate(comment?.author, {
      $pull: { comments: commentId },
    });
    comment?.replies.forEach(async (replyId) => {
      await removeComments(replyId);
    });
  } catch (error) {
    return error;
  }
};

export default router;
