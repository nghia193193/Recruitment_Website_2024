const { OTP } = require("../models/otp.model");
const bcrypt = require('bcryptjs');

module.exports = {
    validOtp: async (otp, hashOtp) => {
        try {
            const isValid = await bcrypt.compare(otp, hashOtp);
            return isValid;
        } catch (error) {
            throw error;
        }
    },
    insertOtp: async (otp, email) => {
        try {
            const hashOtp = await bcrypt.hash(otp, 10);
            const Otp = await OTP.create({
                email,
                otp: hashOtp
            })
            return Otp ? 1 : 0
        } catch (error) {
            throw error;
        }
    },
    resendOtp: async (otp, email) => {
        try {
            const hashOtp = await bcrypt.hash(otp, 10);
            const Otp = await OTP.create({
                email,
                otp: hashOtp
            })
            return Otp ? 1 : 0
        } catch (error) {
            throw error;
        }
    }
}