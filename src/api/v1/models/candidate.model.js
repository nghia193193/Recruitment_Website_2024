const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const candidateSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxLength: 50
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    phone: String,
    gender: {
        type: String,
        enum: ["Nam", "Nữ"]
    },
    avatar: String,
    homeTown: String,
    workStatus: {
        type: String,
        emum: ["Đang tìm việc", "Đã có việc", "Đang tìm nơi thực tập"]
    },
    dateOfBirth: Date,
    verifyEmail: {
        type: Schema.Types.Boolean,
        default: false
    },
    loginId: {
        type: Schema.Types.ObjectId,
        ref: "Login"
    },
    allowSearch: {
        type: Schema.Types.Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = {
    Candidate: model('Candidate', candidateSchema)
};