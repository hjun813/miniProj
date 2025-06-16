// MongoDB에 사용자 정보를 저장하기 위해 Mongoose로 정의한 User 모델

// Mongoose 라이브러리를 불러옵니다 (MongoDB와 연결할 수 있게 해주는 ODM 라이브러리)
const mongoose = require('mongoose');

// 사용자 정보를 저장할 스키마(Schema)를 정의합니다
const userSchema = new mongoose.Schema({
  // 사용자 이름 (아이디 역할)
  username: {
    type: String,       // 문자열로 저장
    required: true,     // 반드시 있어야 함
    unique: true,       // 중복 불가 (하나만 존재해야 함)
    trim: true          // 앞뒤 공백 자동 제거
  },

  // 비밀번호 (암호화된 문자열로 저장 예정)
  password: {
    type: String,
    required: true      // 반드시 있어야 함
  }

}, {
  // 이 옵션을 설정하면 데이터 생성 시간과 수정 시간이 자동으로 저장됨
  timestamps: true
});

// 'User'라는 이름으로 모델을 만들고 외부에서 사용할 수 있게 내보냅니다
module.exports = mongoose.model('User', userSchema);
