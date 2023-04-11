import { Request, Response, NextFunction, request } from 'express';
import jwt from 'jsonwebtoken';
import * as config from '../config/config';

const authorize = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  const authorizationType = header?.split(' ')[0];
  const authorizationToken = header?.split(' ')[1];

  if (authorizationType === 'Bearer' && authorizationToken) {
    try {
      jwt.verify(authorizationToken, config.JWT_SECRET);
      const decodedToken = jwt.decode(authorizationToken);

      req.userId = (decodedToken as jwt.JwtPayload).userId;

      next();
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized access' });
  }
};

export default authorize;
