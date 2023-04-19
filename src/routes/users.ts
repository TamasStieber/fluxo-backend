import { Router } from 'express';
import User from '../models/user';
import Post from '../models/post';
import multer from 'multer';
import bcrypt from 'bcrypt';
import fs from 'fs';
import * as Interfaces from '../interfaces/interfaces';
import { removeDiacritics } from '../utils/utils';
import _ from 'lodash';

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
    const allUsers = await User.find({});
    res.status(200).json({ allUsers });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/current', async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).select('-password');
    res.status(200).json({ currentUser });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({ userName: req.params.username }).select(
      'firstName lastName userName email photosFolder profilePictureUrl createdAt'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/posts', async (req, res, next) => {
  try {
    await Post.find({ author: req.params.id })
      .sort({ _id: -1 })
      .populate({
        path: 'author likes',
        select:
          'firstName lastName userName email photosFolder profilePictureUrl',
      })
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

router.get('/:id/acquaintances', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('acquaintances')
      .populate({
        path: 'acquaintances',
        select:
          'firstName lastName userName email photosFolder profilePictureUrl createdAt',
      });
    res.status(200).json({ acquaintances: user?.acquaintances });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/', upload.single('profilePicture'), async (req, res, next) => {
  const updatedUser = JSON.parse(req.body.data) as Interfaces.User;
  const previousUser = await User.findById(req.userId);

  updatedUser.firstName = _.capitalize(updatedUser.firstName);
  updatedUser.lastName = _.capitalize(updatedUser.lastName);
  updatedUser.fullName = updatedUser.firstName + ' ' + updatedUser.lastName;
  updatedUser.userName = _.toLower(removeDiacritics(updatedUser.userName));

  // const userWithSameName = await User.find({ fullName: updatedUser.fullName });
  // const count =
  //   userWithSameName.length > 0 ? userWithSameName.length.toString() : '';
  // updatedUser.userName =
  //   _.toLower(removeDiacritics(updatedUser.firstName)) +
  //   count +
  //   '.' +
  //   _.toLower(removeDiacritics(updatedUser.lastName));

  const fileName = req.file?.filename;
  if (fileName) updatedUser.profilePictureUrl = fileName;

  try {
    const user = await User.findByIdAndUpdate(req.userId, updatedUser, {
      new: true,
    });
    const userPhotosDir = photosDir + `/${previousUser?.photosFolder}`;
    if (fileName) {
      const previousProfilePicture =
        userPhotosDir + '/' + previousUser?.profilePictureUrl;
      if (
        previousUser?.profilePictureUrl &&
        fs.existsSync(previousProfilePicture)
      )
        fs.unlinkSync(previousProfilePicture);
      fs.renameSync('./temp/' + fileName, userPhotosDir + '/' + fileName);
    }
    res.status(200).json(user);
  } catch {
    next(res.status(500).json({ error: 'Internal server error' }));
  }
});

router.put('/password', async (req, res, next) => {
  const passwords = req.body;
  const previousUser = await User.findById(req.userId);

  if (!previousUser) return res.status(404).json({ error: 'User not found' });

  const isMatch = await bcrypt.compare(
    passwords.oldPassword,
    previousUser.password
  );

  if (!isMatch) return res.status(401).json({ error: 'Incorrect password!' });

  const newPassword = await bcrypt.hash(passwords.newPassword, 10);

  try {
    const user = await User.findByIdAndUpdate(req.userId, {
      password: newPassword,
    });

    res.status(200).json(user);
  } catch {
    next(res.status(500).json({ error: 'Internal server error' }));
  }
});

export default router;
