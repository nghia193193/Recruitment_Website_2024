const { Candidate } = require("../models/candidate.model");
const { OTP } = require("../models/otp.model");
const { Recruiter } = require("../models/recruiter.model");
const { validOtp, insertOtp } = require("./otp.service");
const OTPGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const { createTransporter, sendSignUpMail } = require('../utils/sendMails');
const { Login } = require("../models/login.model");
const RedisService = require("./redis.service");
const JWTService = require("./jwt.service");
const { BadRequestError, InternalServerError, NotFoundRequestError, ConflictRequestError } = require("../core/error.response");
const { findUserByRole } = require("../utils/findUser");
const { fieldOfActivity, jobType, levelRequirement, experience, genderRequirement, provinceOfVietNam, mapRolePermission } = require('../utils');
const client = require('../dbs/init.redis');


class AccessService {

    static recruiterSignUp = async ({ companyName, name, position, phone, contactEmail, email, password }) => {
        try {
            // check user exist by mail
            const recruiter = await Recruiter.findOne({ email }).lean();
            if (recruiter) {
                // check verify email
                if (recruiter.verifyEmail === true) {
                    throw new ConflictRequestError('Email này đã được sử dụng vui lòng nhập email khác');
                }
                // if not verify email check otp exist
                const otpHolder = await OTP.find({ email });
                if (otpHolder.length) {
                    // otp exist tell user to check mail and verify
                    throw new BadRequestError('Email này đã được đăng ký, vui lòng truy cập email để xác nhận tài khoản');
                }
                // otp expired allowed user to Resignup
                await Recruiter.findOneAndDelete({ email });
            }
            // user not exist create new user
            // hash password
            const hashPassword = await bcrypt.hash(password, 10);
            await RedisService.setPassword(email, hashPassword);
            // create recruiter
            const newRecruiter = await Recruiter.create({
                companyName, name, position, phone, contactEmail, email
            })
            await sendSignUpMail({ toEmail: email, userName: newRecruiter.name });
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
            await Recruiter.verifyEmail(email);
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
            // check user exist
            const recruiter = await Recruiter.findOne({ email }).lean();
            if (!recruiter) {
                throw new BadRequestError('Email không tồn tại');
            }
            if (recruiter.verifyEmail === true) {
                throw new BadRequestError('Email của bạn đã được xác nhận');
            }
            // refresh ttl redis password
            const password = await RedisService.getPassword(email);
            await RedisService.setPassword(email, password);
            await sendSignUpMail({ toEmail: email, userName: recruiter.name });
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
                    permission: mapRolePermission[userRole],
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

    static getJobType = async () => {
        try {
            return {
                message: "Lấy danh sách loại hình công việc thành công",
                metadata: {
                    jobType
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static getLevelRequirement = async () => {
        try {
            return {
                message: "Lấy danh sách vị trí công việc thành công",
                metadata: {
                    levelRequirement
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static getExperience = async () => {
        try {
            return {
                message: "Lấy danh sách kinh nghiệm thành công",
                metadata: {
                    experience
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static getGenderRequirement = async () => {
        try {
            return {
                message: "Lấy danh sách yêu cầu giới tính thành công",
                metadata: {
                    genderRequirement
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static getProvince = async () => {
        try {
            return {
                message: "Lấy danh sách tỉnh thành thành công",
                metadata: {
                    provinceOfVietNam
                }
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AccessService;
