import { NextFunction, Request, Response, Router } from 'express';
import * as Interfaces from '../interfaces/interfaces';
import User from '../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as config from '../config/config';

const router = Router();

router.post('/', async (req, res, next) => {
  const { email, password } = req.body as Interfaces.LoginData;

  if (!email || !password)
    return res.status(401).json({ error: 'Missing login credentials' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ error: 'No users found with the given e-mail address' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });
    res.status(200).json({ token: token, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
