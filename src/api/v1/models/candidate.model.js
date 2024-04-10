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
        trim: true,
        maxLength: 50
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    phone: String,
    password: {
        type: String,
        required: true
    },
    gender: String,
    avatar: String,
    address: String,
    dateOfBirth: Date,
    about: String,
    verifyEmail: { 
        type: Schema.Types.Boolean, 
        default: false 
    }
}, {
    timestamps: true
})

candidateSchema.pre('save', async function (next) {
    // send OTP
    const otp = OTPGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
        digits: 6
    })
    const isSaveOtp = await insertOtp(otp, this.email);
    if (isSaveOtp === 0) {
        throw createError.InternalServerError('Có lỗi xảy ra vui lòng thử lại');
    }
    let mailDetails = {
        from: `${process.env.MAIL_SEND}`,
        to: this.email,
        subject: 'Register Account',
        html: ` 
            <div style="text-align: center; font-family: arial">
                <h1 style="color: green; ">JOB POST</h1>
                <h2>Welcome</h2>
                <span style="margin: 1px">Your OTP confirmation code is: <b>${otp}</b></span>
                <p style="margin-top: 0px">Click this link below to verify your account.</p>
                <button style="background-color: #008000; padding: 10px 50px; border-radius: 5px; border-style: none"><a href="${process.env.FE_URL}/otp?email=${email}&name=${name}" style="font-size: 15px;color: white; text-decoration: none">Verify</a></button>
                <p>Thank you for joining us!</p>
                <p style="color: red">Note: This link is only valid in 10 minutes!</p>
            </div>
            `
    };
    transporter.sendMail(mailDetails, err => {
        throw createError.InternalServerError('Gửi mail thất bại');
    });
    // hash Password
    const hashPassword = await bcrypt.hash(this.password, 10);
    this.password = hashPassword;
    next();
})

module.exports = {
    Candidate: model('Candidate', candidateSchema)
};