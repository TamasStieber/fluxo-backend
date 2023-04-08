import { Router } from 'express';
import User from '../models/user';

const router = Router();

router.get('/:query', async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { firstName: { $regex: req.params.query, $options: 'i' } },
        { lastName: { $regex: req.params.query, $options: 'i' } },
      ],
    });
    if (users.length === 0)
      return res.status(404).json({ error: 'No users found' });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
