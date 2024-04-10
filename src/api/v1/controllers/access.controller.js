'use strict'

const accessService = require('../services/access.service');

class AccessController {

    recruiterSignUp = async (req, res, next) => {
        const { companyName, name, position, phone, contactEmail, email, password, confirmPassword } = req.body;
        if (confirmPassword !== password) {
            return res.status(400).json({
                code: '400',
                message: "Mật khẩu xác nhận không chính xác"
            })
        }
        const { code, message, metadata, status } = await accessService.recruiterSignUp(companyName, name, position, phone, contactEmail, email, password);
        res.status(200).json({
            code, message, metadata: metadata ?? null, status: status ?? null
        })
    }

    recruiterVerifyEmail = async (req, res, next) => {
        const email = req.query.email;
        const { otp } = req.body;
        const { code, message, status } = await accessService.recruiterVerifyEmail(email, otp);
        res.status(200).json({
            code, message, status: status ?? null
        })
    }

    recruiterResendVerifyEmail = async (req, res, next) => {
        const { email } = req.body;
        const { code, message, status } = await accessService.recruiterResendVerifyEmail(email);
        res.status(200).json({
            code, message, status: status ?? null
        })
    }

    login = async (req, res, next) => {
        const { email, password } = req.body;
        const { code, message, status, metadata } = await accessService.login(email, password);
        res.status(200).json({
            code, message, status: status ?? null, metadata: metadata ?? null
        })
    }
}

module.exports = new AccessController();