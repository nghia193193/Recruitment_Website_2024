const { Candidate } = require("../models/candidate.model");
const { OTP } = require("../models/otp.model");
const { Recruiter } = require("../models/recruiter.model");
const { validOtp } = require("./otp.service");
const bcrypt = require('bcryptjs');
const { sendSignUpMail, sendForgetPasswordMail } = require('../utils/sendMails');
const { Login } = require("../models/login.model");
const RedisService = require("./redis.service");
const JWTService = require("./jwt.service");
const { BadRequestError, InternalServerError, NotFoundRequestError, ConflictRequestError } = require("../core/error.response");
const { findUserByRole } = require("../utils/findUser");
const { fieldOfActivity, jobType, levelRequirement, experience, genderRequirement, provinceOfVietNam, mapRolePermission, workStatus } = require('../utils');
const client = require('../dbs/init.redis');
const { Job } = require("../models/job.model");
const { randomBytes } = require('crypto');
const EmailService = require("./email.service");

class AccessService {
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

    static forgetPassword = async ({ email }) => {
        try {
            //check Exist
            const user = await Login.findOne({ email }).lean();
            if (!user) {
                throw new BadRequestError('Tài khoản không tồn tại!')
            }
            const account = await findUserByRole(user.role, email);
            const token = randomBytes(32).toString('hex');
            await RedisService.setToken(email, token);
            await EmailService.sendForgetPasswordMail({ toEmail: email, userName: account.name, token: token });
            //return 200
            return {
                message: "Gửi email thành công, vui lòng truy cập email để đổi mật khẩu."
            }
        } catch (error) {
            throw error;
        }
    }

    static resetPassword = async ({ newPassword, email, token }) => {
        try {
            //check token
            const redisToken = await RedisService.getEmailKey(email);
            if (!redisToken) {
                throw new BadRequestError("Đã hết thời hạn 60 phút kể từ lúc gửi yêu cầu. Vui lòng thực hiện lại yêu cầu.");
            }
            if (redisToken !== token) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            //update password
            const hashNewPassword = await bcrypt.hash(newPassword, 10);
            const result = await Login.findOneAndUpdate({ email }, {
                $set: {
                    password: hashNewPassword
                }
            }, {
                new: true
            })
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            return {
                message: "Cập nhật mật khẩu thành công."
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

    static getWorkStatus = async () => {
        try {
            return {
                message: "Lấy danh sách trạng thái công việc thành công",
                metadata: {
                    workStatus
                }
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AccessService;
