import { Router } from 'express';
import * as Interfaces from '../interfaces/interfaces';
import User from '../models/user';
import bcrypt from 'bcrypt';
import fs from 'fs';
import multer from 'multer';
import _ from 'lodash';
import { removeDiacritics, welcomeMessageContent } from '../utils/utils';
import Conversation from '../models/conversation';
import Message from '../models/message';

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

router.post('/', upload.single('profilePicture'), async (req, res, next) => {
  const newUser = JSON.parse(req.body.data) as Interfaces.User;

  const fileName = req.file?.filename;

  try {
    const existingUser = await User.find({ email: newUser.email });
    if (existingUser.length > 0) {
      fileName && fs.unlinkSync('./temp/' + fileName);
      return next(
        res
          .status(400)
          .json({ error: 'This email address is already registered' })
      );
    }
  } catch {
    fileName && fs.unlinkSync('./temp/' + fileName);
    return next(res.status(500).json({ error: 'Internal server error' }));
  }

  newUser.firstName = _.capitalize(newUser.firstName);
  newUser.lastName = _.capitalize(newUser.lastName);
  newUser.fullName = newUser.firstName + ' ' + newUser.lastName;

  const userWithSameName = await User.find({ fullName: newUser.fullName });
  const count =
    userWithSameName.length > 0 ? userWithSameName.length.toString() : '';
  newUser.userName =
    _.toLower(removeDiacritics(newUser.firstName)) +
    count +
    '.' +
    _.toLower(removeDiacritics(newUser.lastName));

  newUser.password = await bcrypt.hash(newUser.password, 10);

  const stringFromRandom = Math.random().toString(16).substring(2, 8);
  const stringFromCurrentDate = Date.now().toString(16).substring(5);
  const photosFolder = stringFromCurrentDate + stringFromRandom;

  newUser.photosFolder = photosFolder;
  newUser.profilePictureUrl = fileName ? fileName : '';

  try {
    const createdUser = await User.create(newUser);
    const userPhotosDir = photosDir + `/${photosFolder}`;
    if (!fs.existsSync(userPhotosDir)) {
      fs.mkdirSync(userPhotosDir);
    }
    fileName &&
      fs.renameSync('./temp/' + fileName, userPhotosDir + '/' + fileName);

    //
    const sender = await User.findOne({ userName: 'kalman.beka' });
    const content = welcomeMessageContent;
    const messageContent = {
      sender: sender?._id,
      receiver: createdUser._id,
      content: content,
    };
    const newMessage = await Message.create(messageContent);
    const newConversation = await Conversation.create({
      participants: [sender, createdUser._id],
      messages: [newMessage._id],
      lastMessage: newMessage,
    });

    createdUser.lastReadMessages.push({
      conversation: newConversation._id,
      lastReadMessage: null!,
    });
    createdUser.save();
    sender?.lastReadMessages.push({
      conversation: newConversation._id,
      lastReadMessage: newMessage._id,
    });
    sender?.save();
    //

    res.status(201).json(createdUser);
  } catch {
    next(res.status(500).json({ error: 'Internal server error' }));
  }
});

export default router;
