const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

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

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, category, link } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: '제목과 내용을 모두 입력해주세요.' });
    }

    const newPost = new Post({
      title,
      content,
      link,
      category: category || '교육',
      author: req.user.id, // 로그인된 사용자 ID
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error('게시글 작성 오류:', err);
    res.status(500).json({ message: '게시글 작성 실패' });
  }
});


router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const posts = await Post.find(filter)
      .populate("author", "username")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "게시글 목록 조회 실패", error: err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username'
        }
      });
    
    if(!post) {
        return res.status(404).json({message: '게시글을 찾을 수 없습니다.'});
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({message: '서버 오류'})
}
});

//수정
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content, category, link } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    }

    // 작성자가 아닌 경우
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: '게시글을 수정할 권한이 없습니다.' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.link = link;

    await post.save();

    res.json({ message: '게시글이 수정되었습니다.', post });
  } catch (err) {
    console.error('게시글 수정 오류:', err);
    res.status(500).json({ message: '게시글 수정 실패' });
  }
});

// 삭제
router.delete('/:id', authMiddleware, async(req, res) =>{
    try{
        
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({message: '게시글이 존재하지 않습니다.'});
        }

        if(post.author.toString() !== req.user.id){
            return res.status(403).json({message: '게시글을 삭제할 권한이 없습니다.'});
        }

        await post.deleteOne();

        res.json({ message: '게시글이 삭제되었습니다.' });
        

    } catch(err){
        console.error('게시글 삭제 오류:', err);
        res.status(500).json({message: '게시글 삭제 실패'});
    }
})


module.exports = router;
