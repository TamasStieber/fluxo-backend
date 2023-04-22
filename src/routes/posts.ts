import { Router } from 'express';
import * as Interfaces from '../interfaces/interfaces';
import Post from '../models/post';
import User from '../models/user';
import mongoose from 'mongoose';
import Comment from '../models/comment';
import multer from 'multer';
import fs from 'fs';

const router = Router();

const photosDir = './photos';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './temp');
  },
  filename: function (req, file, cb) {
    const extension = '.' + file.originalname.split('.').pop();
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + extension;
    cb(null, 'fluxo' + '-' + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

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

router.post('/', upload.array('file'), async (req, res, next) => {
  try {
    const newPost = JSON.parse(req.body.data) as Interfaces.Post;

    const files = req.files as Express.Multer.File[];
    newPost.photos = files.map((file) => file.filename);

    const post = await Post.create(newPost);

    const author = await User.findById(req.userId);

    if (author) {
      author.posts.push(post._id);
      author.photos.push(...newPost.photos);
    }

    await author?.save();

    await post.populate({
      path: 'author',
      select:
        'firstName lastName userName fullName photosFolder profilePictureUrl',
    });

    const photosFolder = photosDir + '/' + author?.photosFolder;

    files.forEach((file) =>
      fs.renameSync(
        './temp/' + file.filename,
        photosFolder + '/' + file.filename
      )
    );

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
