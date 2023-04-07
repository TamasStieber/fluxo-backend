import { NextFunction, Request, Response, Router } from 'express';
import * as Interfaces from '../interfaces/interfaces';
import User from '../models/user';
import bcrypt from 'bcrypt';
import passport from 'passport';
import passportLocal from 'passport-local';
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
// const LocalStrategy = passportLocal.Strategy;

// passport.use(
//   new LocalStrategy(
//     { usernameField: 'email' },
//     async (email, password, done) => {
//       const user = await User.findOne({ email });
//       if (!user) return done(null, false, { message: 'invalid email' });

//       const passwordMatch = await bcrypt.compare(password, user.password);
//       if (!passwordMatch)
//         return done(null, false, { message: 'invalid password' });

//       return done(null, user);
//     }
//   )
// );

// router.post('/', (req, res, next) => {
//   passport.authenticate(
//     'local',
//     (error: Error | null, user?: Interfaces.User | false, info?: any) => {
//       if (error) {
//         return next(error);
//       }
//       if (!user) {
//         return res.status(401).json(info);
//       }
//       return res.status(200).json({ user });
//     }
//   )(req, res, next);
// });

export default router;
