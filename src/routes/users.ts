import { Router } from 'express';
import User from '../models/user';
import Post from '../models/post';
import multer from 'multer';
import bcrypt from 'bcrypt';
import fs from 'fs';
import * as Interfaces from '../interfaces/interfaces';

const router = Router();

const usersDir = './users';

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
    const allUsers = await User.find({});
    res.status(200).json({ allUsers });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
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

router.put('/:id', upload.single('profilePicture'), async (req, res, next) => {
  const updatedUser = JSON.parse(req.body.data) as Interfaces.User;
  const previousUser = await User.findById(req.params.id);

  const fileName = req.file?.filename;
  if (fileName) updatedUser.profilePictureUrl = fileName;

  try {
    const user = await User.findByIdAndUpdate(req.params.id, updatedUser);
    const userDir = usersDir + `/${req.params.id}`;
    if (fileName) {
      fs.unlinkSync(userDir + '/photos/' + previousUser?.profilePictureUrl);
      fs.renameSync('./temp/' + fileName, userDir + '/photos/' + fileName);
    }
    res.status(200).json(user);
  } catch {
    next(res.status(500).json({ error: 'Internal server error' }));
  }
});

router.put('/:id/password', async (req, res, next) => {
  const passwords = req.body;
  const previousUser = await User.findById(req.params.id);

  if (!previousUser) return res.status(404).json({ error: 'User not found' });

  const isMatch = await bcrypt.compare(
    passwords.oldPassword,
    previousUser.password
  );

  if (!isMatch) return res.status(401).json({ error: 'Incorrect password!' });

  const newPassword = await bcrypt.hash(passwords.newPassword, 10);

  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      password: newPassword,
    });
    res.status(200).json(user);
  } catch {
    next(res.status(500).json({ error: 'Internal server error' }));
  }
});

export default router;
