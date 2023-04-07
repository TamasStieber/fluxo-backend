import { Router } from 'express';
import * as Interfaces from '../interfaces/interfaces';
import User from '../models/user';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/', async (req, res, next) => {
  const newUser = req.body as Interfaces.User;

  try {
    const existingUser = await User.find({ email: newUser.email });
    console.log(existingUser);

    if (existingUser.length > 0)
      return next(res.status(400).json({ error: 'User already exists' }));
  } catch {
    return next(res.status(500).json({ error: 'Internal server error' }));
  }

  newUser.password = await bcrypt.hash(newUser.password, 10);

  try {
    const user = await User.create(newUser);
    res.status(201).json(user);
  } catch {
    next(res.status(500).json({ error: 'Internal server error' }));
  }
});

export default router;
