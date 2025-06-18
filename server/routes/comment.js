// server/routes/comment.js
const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");

// 인증 미들웨어
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "인증이 필요합니다." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};

// 댓글 작성
router.post('/:postId', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!content) {
      return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    // 게시글 존재 확인
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 댓글 생성
    const newComment = new Comment({
      content,
      author: req.user.id,
      post: postId
    });

    await newComment.save();

    // 게시글에 댓글 추가
    post.comments.push(newComment._id);
    await post.save();

    // 작성자 정보와 함께 반환
    const populatedComment = await Comment.findById(newComment._id).populate('author', 'username');
    
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error('댓글 작성 오류:', err);
    res.status(500).json({ message: '댓글 작성 실패' });
  }
});

// 게시글의 모든 댓글 조회
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    const comments = await Comment.find({ post: postId })
      .populate('author', 'username')
      .sort({ createdAt: 1 });
      
    res.json(comments);
  } catch (err) {
    console.error('댓글 조회 오류:', err);
    res.status(500).json({ message: '댓글 조회 실패' });
  }
});

// 댓글 삭제
router.delete('/:commentId', authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }
    
    // 작성자 확인
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: '댓글을 삭제할 권한이 없습니다.' });
    }
    
    // 게시글에서 댓글 ID 제거
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId }
    });
    
    // 댓글 삭제
    await comment.deleteOne();
    
    res.json({ message: '댓글이 삭제되었습니다.' });
  } catch (err) {
    console.error('댓글 삭제 오류:', err);
    res.status(500).json({ message: '댓글 삭제 실패' });
  }
});

module.exports = router;