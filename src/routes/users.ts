import { Router } from 'express';
import User from '../models/user';
import Post from '../models/post';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const allUsers = await User.find({});
    res.status(200).json({ allUsers });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    // const user = await User.findById(req.params.id);
    // res.status(200).json({ user });
    await User.findById(req.params.id)
      .populate('posts')
      .exec()
      .then((user) => {
        res.status(200).json({ user });
      })
      .catch(() => {
        next(res.status(500).json({ error: 'Internal server error' }));
      });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/posts', async (req, res, next) => {
  try {
    // const user = await User.findById(req.params.id);
    // res.status(200).json({ user });
    await Post.find({ author: req.params.id })
      .sort({ _id: -1 })
      .populate('author likes')
      .exec()
      .then((posts) => {
        res.status(200).json({ posts });
      })
      .catch(() => {
        next(res.status(500).json({ error: 'Internal server error' }));
      });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
