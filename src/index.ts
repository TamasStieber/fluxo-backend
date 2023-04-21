import * as config from './config/config';
import express from 'express';
import mongoose from 'mongoose';
import authorization from './middlewares/auth';
import registerRouter from './routes/register';
import loginRouter from './routes/login';
import usersRouter from './routes/users';
import postsRouter from './routes/posts';
import searchRouter from './routes/search';
import messagesRouter from './routes/messages';
import friendRequestsRouter from './routes/friendRequests';
import commentsRouter from './routes/comments';
import cors from 'cors';
import morgan from 'morgan';

const server = express();

server.use(cors());
server.use(morgan('tiny'));
server.use(express.json());
server.use(express.static('photos'));
server.use('/register', registerRouter);
server.use('/login', loginRouter);
server.use('/users', authorization, usersRouter);
server.use('/posts', authorization, postsRouter);
server.use('/search', authorization, searchRouter);
server.use('/messages', authorization, messagesRouter);
server.use('/friend-requests', authorization, friendRequestsRouter);
server.use('/comments', authorization, commentsRouter);

server.use((req, res) => {
  res.status(404).json({ error: 'Not found' }).end();
});

mongoose.set('strictQuery', true);

const main = async () => {
  try {
    await mongoose
      .connect(config.MONGO_PATH)
      .then(() => console.log('Connected to MongoDB'));
  } catch (error) {
    console.error('Could not connect to MongoDB', error);
  }
  server.listen(config.PORT, () =>
    console.log(`Server is listening on ${config.PORT}`)
  );
};

main().catch((error) => console.error(error));
