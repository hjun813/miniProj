const express = require('express'); // 웹 서버 프레임워크
const cors = require('cors'); // CORS 정책 허용
const bodyParser = require('body-parser'); // 요청 JSON 처리
const mongoose = require('mongoose'); // MongoDB 연결을 위한 라이브러리
require('dotenv').config(); // .env 파일을 읽어서 환경 변수로 등록

const app = express();
const PORT = process.env.PORT || 5000; // 포트 설정 (기본값 5000)

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 미들웨어 설정
app.use(cors()); // 다른 포트에서 오는 요청 허용 (ex. 프론트에서)
app.use(bodyParser.json()); // JSON 형식의 요청 본문을 읽을 수 있게 함

// 📌 [여기 추가!] auth 라우터 연결
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// 테스트용 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
