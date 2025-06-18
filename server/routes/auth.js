// 회원가입과 로그인 기능을 구현한 Express 라우터.

const express = require("express");
const router = express.Router(); // 라우터 객체 생성

const User = require("../models/User"); // User 모델 불러오기
const bcrypt = require("bcrypt"); // 비밀번호 암호화에 사용할 라이브러리
const jwt = require("jsonwebtoken"); // 로그인 시 사용할 토큰 생성 라이브러리

// 📌 회원가입 API: POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body; // 클라이언트가 보낸 데이터 추출

    // 기존에 동일한 username이 있는지 확인
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "이미 존재하는 사용자입니다." });
    }

    // 비밀번호를 해싱(암호화)합니다 (saltRounds는 보안 강도)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 유저 객체 생성
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    // MongoDB에 저장
    await newUser.save();

    res.status(201).json({ message: "회원가입 성공!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 📌 로그인 API: POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 사용자 존재 여부 확인
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "존재하지 않는 사용자입니다." });
    }

    // 비밀번호 일치 여부 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // JWT 토큰 발급
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // 토큰 유효 시간: 1시간
    );

    res.json({ 
      token,
      username: user.username,
      message: "로그인 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
