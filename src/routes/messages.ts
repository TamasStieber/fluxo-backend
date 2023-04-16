import { Router } from 'express';
import Message from '../models/message';
import * as Interfaces from '../interfaces/interfaces';
import User from '../models/user';
import mongoose from 'mongoose';
import Conversation from '../models/conversation';

const router = Router();

router.post('/', async (req, res) => {
  const message = req.body as Interfaces.Message;
  const newMessage = await Message.create(message);

  try {
    const existingConversation = await Conversation.findOneAndUpdate(
      { participants: { $all: [message.sender, message.receiver] } },
      {
        $push: { messages: newMessage._id },
        $set: { lastMessage: newMessage },
      }
    );

    if (existingConversation) {
      await User.findOneAndUpdate(
        {
          _id: message.sender,
          'lastReadMessages.conversation': existingConversation._id,
        },
        { $set: { 'lastReadMessages.$.lastReadMessage': newMessage._id } }
      );
      return res.status(200).json({ message });
    }

    const newConversation = await Conversation.create({
      participants: [message.sender, message.receiver],
      messages: [newMessage._id],
      lastMessage: newMessage,
    });

    await newConversation.populate('participants messages');

    await User.findByIdAndUpdate(message.sender, {
      $push: {
        lastReadMessages: {
          conversation: newConversation._id,
          lastReadMessage: newMessage._id,
        },
      },
    });
    await User.findByIdAndUpdate(message.receiver, {
      $push: {
        lastReadMessages: {
          conversation: newConversation._id,
          lastReadMessage: null,
        },
      },
    });

    res.status(200).json({ newConversation });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/user/', async (req, res) => {
  try {
    await Conversation.find({ participants: req.userId })
      .sort({ updatedAt: -1 })
      .populate('participants')
      .exec()
      .then((conversations) => {
        res.status(200).json({ conversations });
      })
      .catch(() => {
        res.status(500).json({ error: 'Internal server error' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:conversationId', async (req, res) => {
  try {
    await Conversation.findById(req.params.conversationId)
      .populate('participants messages')
      .exec()
      .then(async (conversation) => {
        await User.findOneAndUpdate(
          {
            _id: req.userId,
            'lastReadMessages.conversation': conversation?._id,
          },
          {
            $set: {
              'lastReadMessages.$.lastReadMessage':
                conversation?.lastMessage._id,
            },
          }
        );
        res.status(200).json({ conversation });
      })
      .catch(() => {
        res.status(500).json({ error: 'Internal server error' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
