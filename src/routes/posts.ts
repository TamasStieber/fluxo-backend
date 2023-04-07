import { Router } from 'express';
import * as Interfaces from '../interfaces/interfaces';
import Post from '../models/post';
import User from '../models/user';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    Post.find()
      .sort({ _id: -1 })
      .populate('author likes')
      .exec()
      .then((allPosts) => {
        res.status(200).json(allPosts);
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
    await User.findByIdAndUpdate(newPost.author, {
      $push: { posts: post._id },
    });

    res.status(201).json(post);
  } catch {
    next(res.status(500).json({ error: 'Internal server error' }));
  }
});

router.put('/:id/add-like', async (req, res, next) => {
  const userId = req.body.id;

  try {
    await Post.findByIdAndUpdate(req.params.id, {
      $push: { likes: userId },
    });
    await User.findByIdAndUpdate(userId, {
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
  const userId = req.body.id;

  try {
    await Post.findByIdAndUpdate(req.params.id, {
      $pull: { likes: userId },
    });
    await User.findByIdAndUpdate(userId, {
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

export default router;
