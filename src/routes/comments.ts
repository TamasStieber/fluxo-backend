import { Router } from 'express';
import Post from '../models/post';
import { IComment } from '../interfaces/interfaces';
import Comment from '../models/comment';
import User from '../models/user';

const router = Router();

router.get('/:postId', async (req, res) => {
  try {
    const skip = parseInt(req.query.skip as string);
    const limit = parseInt(req.query.limit as string);

    const post = await Post.findById(req.params.postId)
      .select('comments')
      .populate({
        path: 'comments',
        options: {
          sort: { createdAt: -1 },
          skip: skip,
          limit: limit,
        },
        populate: {
          path: 'author',
          select:
            'firstName lastName userName fullName photosFolder profilePictureUrl',
        },
      });

    const comments = await Comment.find({ post: req.params.postId });

    res.status(200).json({ comments: post?.comments, count: comments.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const comment = await Comment.create(req.body as IComment);
    const post = await Post.findById(comment.post);
    if (post) {
      post.comments.push(comment._id);
      post.commentsCount++;
      await post.save();
    }
    const author = await User.findById(comment.author);
    if (author) {
      author.comments.push(comment._id);
      await author.save();
    }
    const populatedComment = await comment.populate({
      path: 'author',
      select:
        'firstName lastName userName fullName photosFolder profilePictureUrl',
    });
    res.status(201).json({ comment: populatedComment });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/replies/:commentId', async (req, res) => {
  try {
    const skip = parseInt(req.query.skip as string);
    const limit = parseInt(req.query.limit as string);

    const comment = await Comment.findById(req.params.commentId)
      .select('replies repliesCount')
      .populate({
        path: 'replies',
        options: {
          sort: { createdAt: -1 },
          skip: skip,
          limit: limit,
        },
        populate: {
          path: 'author',
          select:
            'firstName lastName userName fullName photosFolder profilePictureUrl',
        },
      });

    res
      .status(200)
      .json({ replies: comment?.replies, count: comment?.repliesCount });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reply', async (req, res) => {
  try {
    const reply = await Comment.create(req.body as IComment);
    const comment = await Comment.findById(reply.replyTo);
    if (comment) {
      comment.replies.push(reply._id);
      comment.repliesCount++;
      await comment.save();
    }
    const author = await User.findById(reply.author);
    if (author) {
      author.comments.push(reply._id);
      await author.save();
    }
    const populatedReply = await reply.populate({
      path: 'author',
      select:
        'firstName lastName userName fullName photosFolder profilePictureUrl',
    });
    res.status(201).json({ reply: populatedReply });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
