import { Router } from 'express';
import * as Interfaces from '../interfaces/interfaces';
import User from '../models/user';
import bcrypt from 'bcrypt';
import fs from 'fs';
import multer from 'multer';

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

router.post('/', upload.single('profilePicture'), async (req, res, next) => {
  const newUser = JSON.parse(req.body.data) as Interfaces.User;

  const fileName = req.file?.filename;
  newUser.profilePictureUrl = fileName ? fileName : '';

  try {
    const existingUser = await User.find({ email: newUser.email });
    if (existingUser.length > 0) {
      fileName && fs.unlinkSync('./temp/' + fileName);
      return next(res.status(400).json({ error: 'User already exists' }));
    }
  } catch {
    fileName && fs.unlinkSync('./temp/' + fileName);
    return next(res.status(500).json({ error: 'Internal server error' }));
  }

  newUser.password = await bcrypt.hash(newUser.password, 10);

  try {
    const user = await User.create(newUser);
    const userDir = usersDir + `/${user._id}`;
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir);
      fs.mkdirSync(userDir + '/photos');
    }
    fileName &&
      fs.renameSync('./temp/' + fileName, userDir + '/photos/' + fileName);
    res.status(201).json(user);
  } catch {
    next(res.status(500).json({ error: 'Internal server error' }));
  }
});

export default router;
