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

candidateSchema.statics.getInformation = async function (userId) {
    try {
        const candidateInfor = await this.findById(userId).populate("loginId").lean().select(
            '-createdAt -updatedAt -__v'
        );
        if (!candidateInfor) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
        }
        candidateInfor.role = candidateInfor.loginId?.role;
        delete candidateInfor.loginId;
        candidateInfor.avatar = candidateInfor.avatar?.url ?? null;
        candidateInfor.phone = candidateInfor.phone ?? null;
        candidateInfor.gender = candidateInfor.gender ?? null;
        candidateInfor.homeTown = candidateInfor.homeTown ?? null;
        candidateInfor.workStatus = candidateInfor.workStatus ?? null;
        candidateInfor.dateOfBirth = candidateInfor.dateOfBirth ?? null;
        return candidateInfor;
    } catch (error) {
        throw error;
    }
}

candidateSchema.statics.updateInformation = async function ({ userId, name, phone, gender, homeTown, workStatus, dateOfBirth }) {
    try {
        const result = await this.findOneAndUpdate({ _id: userId }, {
            $set: {
                name, phone, gender, homeTown, workStatus, dateOfBirth
            }
        }, {
            new: true,
            select: { createdAt: 0, updatedAt: 0, __v: 0 }
        }).lean().populate('loginId')
        if (!result) {
            throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại');
        }
        result.role = result.loginId?.role;
        delete result.loginId;
        result.avatar = result.avatar?.url ?? null;
        result.phone = result.phone ?? null;
        result.gender = result.gender ?? null;
        result.homeTown = result.homeTown ?? null;
        result.workStatus = result.workStatus ?? null;
        result.dateOfBirth = result.dateOfBirth ?? null;
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Candidate: model('Candidate', candidateSchema)
};