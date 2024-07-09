const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const model = mongoose.model;
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    email: String,
    otp: String,
    time: {type: Date, default: Date.now(), index: {expires: 60*10}} // 10p expire delete from db
}, {
    timestamps: true
})

module.exports = {
    OTP: model('OTP', otpSchema)
};