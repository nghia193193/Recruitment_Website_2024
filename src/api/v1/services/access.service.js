const { Candidate } = require("../models/candidate.model");
const { OTP } = require("../models/otp.model");
const { Recruiter } = require("../models/recruiter.model");
const { validOtp, insertOtp } = require("./otp.service");
const OTPGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const { createTransporter } = require('../utils/sendMails');
const { Login } = require("../models/login.model");
const RedisService = require("./redis.service");
const JWTService = require("./jwt.service");
const { BadRequestError, InternalServerError, NotFoundRequestError, ConflictRequestError } = require("../core/error.response");
const { findUserByRole } = require("../utils/findUser");
const { fieldOfActivity } = require('../utils');
const client = require('../dbs/init.redis');


class AccessService {

    static recruiterSignUp = async ({ companyName, name, position, phone, contactEmail, email, password }) => {
        try {
            // check email exist
            const isExist = await Recruiter.findOne({ email }).lean();
            if (isExist) {
                throw new ConflictRequestError('Tài khoản đã tồn tại');
            }
            // hash password
            const hashPassword = await bcrypt.hash(password, 10);
            await RedisService.setPassword(email, hashPassword);
            // create recruiter
            const newRecruiter = await Recruiter.create({
                companyName, name, position, phone, contactEmail, email
            })
            // create otp
            const otp = OTPGenerator.generate(6, {
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
                digits: 6
            })
            // save otp to db
            const isSaveOtp = await insertOtp(otp, email);
            if (isSaveOtp === 0) {
                throw new InternalServerError("Có lỗi xảy ra trong quá trình xử lý");
            }
            // send mail
            let mailDetails = {
                from: `${process.env.MAIL_SEND}`,
                to: email,
                subject: 'Register Account',
                html: ` 
                    <div style="text-align: center; font-family: arial">
                        <h1 style="color: green; ">JOB POST</h1>
                        <h2>Welcome</h2>
                        <span style="margin: 1px">Your OTP confirmation code is: <b>${otp}</b></span>
                        <p style="margin-top: 0px">Click this link below to verify your account.</p>
                        <button style="background-color: #008000; padding: 10px 50px; border-radius: 5px; border-style: none"><a href="${process.env.FE_URL}/otp?email=${email}" style="font-size: 15px;color: white; text-decoration: none">Verify</a></button>
                        <p>Thank you for joining us!</p>
                        <p style="color: red">Note: This link is only valid in 10 minutes!</p>
                    </div>
                    `
            };
            const transporter = await createTransporter();
            transporter.sendMail(mailDetails, err => {
                throw new InternalServerError('Có lỗi xảy ra');
            });
            // return 201
            return {
                message: "Đăng ký tài khoản thành công",
                metadata: {
                    sender: process.env.MAIL_SEND
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static recruiterVerifyEmail = async (email, otp) => {
        try {
            // get last otp
            const otpHolder = await OTP.find({ email });
            if (!otpHolder.length) {
                throw new NotFoundRequestError('OTP hết hạn vui lòng làm mới');
            }
            const lastOtp = otpHolder[otpHolder.length - 1].otp;
            // verify otp
            const isValid = await validOtp(otp, lastOtp);
            if (!isValid) {
                throw new BadRequestError('OTP không chính xác')
            }
            // verify Email
            const result = await Recruiter.verifyEmail(email);
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra');
            }
            // add recruiter to login
            const hashPassword = await RedisService.getPassword(email);
            const login = await Login.create({
                email,
                password: hashPassword,
                role: "RECRUITER",
            })
            // Reference Recruiter, Login
            await Recruiter.findOneAndUpdate({ email }, {
                $set: {
                    loginId: login._id
                }
            })
            // delete redis password
            await RedisService.deletePassword(email);
            // delete all otp verify in db
            await OTP.deleteMany({ email });
            //return 200
            return {
                message: "Xác nhận email thành công",
            }
        } catch (error) {
            throw error;
        }
    }

    static recruiterResendVerifyEmail = async ({ email }) => {
        try {
            // check email exist
            const isExist = await Recruiter.findOne({ email }).lean();
            if (!isExist) {
                throw new BadRequestError('Email không tồn tại');
            }
            if (isExist.verifyEmail === true) {
                throw new BadRequestError('Email của bạn đã được xác nhận');
            }
            // create otp
            const otp = OTPGenerator.generate(6, {
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
                digits: 6
            })
            // save otp to db
            const isSaveOtp = await insertOtp(otp, email);
            if (isSaveOtp === 0) {
                throw new InternalServerError('Có lỗi xảy ra');
            }
            // refresh ttl redis password
            const password = await RedisService.getPassword(email);
            await RedisService.setPassword(email, password);
            // send mail
            let mailDetails = {
                from: `${process.env.MAIL_SEND}`,
                to: email,
                subject: 'Register Account',
                html: ` 
                    <div style="text-align: center; font-family: arial">
                        <h1 style="color: green; ">JOB POST</h1>
                        <h2>Welcome</h2>
                        <span style="margin: 1px">Your OTP confirmation code is: <b>${otp}</b></span>
                        <p style="margin-top: 0px">Click this link below to verify your account.</p>
                        <button style="background-color: #008000; padding: 10px 50px; border-radius: 5px; border-style: none"><a href="${process.env.FE_URL}/otp?email=${email}" style="font-size: 15px;color: white; text-decoration: none">Verify</a></button>
                        <p>Thank you for joining us!</p>
                        <p style="color: red">Note: This link is only valid in 10 minutes!</p>
                    </div>
                    `
            };
            const transporter = await createTransporter();
            transporter.sendMail(mailDetails, err => {
                throw new InternalServerError('Có lỗi xảy ra');
            });
            // return 200
            return {
                message: "Gửi lại mail xác nhận thành công",
                metadata: {
                    sender: process.env.MAIL_SEND
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static login = async ({ email, password }) => {
        try {
            //check Exist
            const userLogin = await Login.findOne({ email }).lean();
            if (!userLogin) {
                throw new BadRequestError('Tài khoản không tồn tại')
            }
            //check Password
            const passwordValid = await bcrypt.compare(password, userLogin.password);
            if (!passwordValid) {
                throw new BadRequestError('Mật khẩu không chính xác')
            }
            // sign AT & RT
            const userRole = userLogin.role;
            const user = await findUserByRole(userRole, email);
            if (!user) {
                throw new BadRequestError('Tài khoản không tồn tại')
            }
            const accessToken = await JWTService.signAccessToken(user._id.toString());
            const refreshToken = await JWTService.signRefreshToken(user._id.toString());
            //return 200
            return {
                message: "Đăng nhập thành công",
                metadata: {
                    tokens: {
                        accessToken,
                        refreshToken
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static refreshAccessToken = async ({ refreshToken }) => {
        try {
            if (!refreshToken) throw new BadRequestError();
            const { userId } = await JWTService.verifyRefreshToken(refreshToken);
            const accessToken = await JWTService.signAccessToken(userId);
            const refToken = await JWTService.signRefreshToken(userId);
            return {
                message: "Làm mới access token thành công",
                metadata: {
                    accessToken,
                    refreshToken: refToken
                }
            }
        } catch (error) {
            console.log("Errorrrrr service: ", error)
            throw error;
        }
    }

    static logout = async ({ refreshToken }) => {
        try {
            if (!refreshToken) {
                throw new BadRequestError();
            }
            const { userId } = await JWTService.verifyRefreshToken(refreshToken);
            await client.del(userId);
            return {
                message: "Logout thành công",
            }
        } catch (error) {
            throw error;
        }
    }

    static getFieldOfActivity = async () => {
        try {
            return {
                message: "Lấy danh sách lĩnh vực thành công",
                metadata: {
                    fieldOfActivity
                }
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AccessService;
