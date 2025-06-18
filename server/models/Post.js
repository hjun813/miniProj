// server/models/Post.js
const mongoose = require('mongoose');

// 게시글 스키마 정의
const postSchema = new mongoose.Schema(
    {
    title: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: false,
    },
    content: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        default: '교육',
        enum: ['교육', '디자인', '생산성', '기타']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, // 작성자는 User와 연결
        ref: 'User',
        required: true,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    createdAt:{
        type: Date,
        default: Date.now,
    },
}
);

module.exports = mongoose.model('Post',postSchema);