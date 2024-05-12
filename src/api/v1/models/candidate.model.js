const mongoose = require('mongoose');
const OTPGenerator = require('otp-generator');
const { insertOtp } = require('../services/otp.service');
const { transporter } = require('../utils/sendMails');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
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
    address: String,
    dateOfBirth: Date,
    about: String,
    verifyEmail: { 
        type: Schema.Types.Boolean, 
        default: false 
    },
    loginId: {
        type: Schema.Types.ObjectId,
        ref: "Login"
    }
}, {
    timestamps: true
})

candidateSchema.statics.verifyEmail = async function (email) {
    try {
        const result = await this.findOneAndUpdate({ email }, {
            $set: {
                verifyEmail: true
            }
        }, {
            new: true
        })
        if (!result) {
            throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại');
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Candidate: model('Candidate', candidateSchema)
};