const express = require('express'); // 웹 서버 프레임워크
const cors = require('cors'); // CORS 정책 허용
const bodyParser = require('body-parser'); // 요청 JSON 처리
const mongoose = require('mongoose'); // MongoDB 연결 라이브러리
require('dotenv').config(); // .env 파일 환경변수로 등록

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 미들웨어 등록
app.use(cors());
app.use(bodyParser.json());

// 🔐 사용자 인증 라우터
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// 📝 게시글 라우터
const postRoutes = require('./routes/post');
app.use('/api/posts', postRoutes);

// 💬 댓글 라우터
const commentRoutes = require('./routes/comment');
app.use('/api/comments', commentRoutes);

// 기본 테스트 라우트
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
