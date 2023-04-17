import { Router } from 'express';
import FriendRequest from '../models/friendRequest';
import User from '../models/user';

const router = Router();

router.get('/:requestId', async (req, res) => {
  try {
    await FriendRequest.findById(req.params.requestId)
      .populate({
        path: 'sender',
        select: 'firstName lastName userName photosFolder profilePictureUrl',
      })
      .exec()
      .then((friendRequest) => res.status(200).json({ friendRequest }));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/receiver/:receiverId', async (req, res) => {
  try {
    const friendRequest = await FriendRequest.findOne({
      sender: req.userId,
      receiver: req.params.receiverId,
    });
    res.status(200).json({ friendRequest });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const friendRequest = await FriendRequest.create({
      sender: req.userId,
      receiver: req.body.receiver,
      status: 'pending',
    });

    await User.findByIdAndUpdate(req.body.receiver, {
      $push: { friendRequests: friendRequest },
    });
    res.status(201).json({ friendRequest });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:friendRequestId', async (req, res) => {
  try {
    const friendRequestToDelete = await FriendRequest.findByIdAndDelete(
      req.params.friendRequestId
    );

    await User.findByIdAndUpdate(friendRequestToDelete?.receiver, {
      $pull: { friendRequests: req.params.friendRequestId },
    });
    res.status(200).json({ friendRequestToDelete });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:friendRequestId/accept', async (req, res) => {
  try {
    const friendRequestToDelete = await FriendRequest.findByIdAndDelete(
      req.params.friendRequestId
    );

    await User.findByIdAndUpdate(req.userId, {
      $pull: { friendRequests: req.params.friendRequestId },
      $push: { acquaintances: friendRequestToDelete?.sender },
    });

    res.status(200).json({ friendRequestToDelete });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:friendRequestId/reject', async (req, res) => {
  try {
    const friendRequestToDelete = await FriendRequest.findByIdAndDelete(
      req.params.friendRequestId
    );

    await User.findByIdAndUpdate(friendRequestToDelete?.receiver, {
      $pull: { friendRequests: req.params.friendRequestId },
    });
    res.status(200).json({ friendRequestToDelete });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
