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
            console.log(error);
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
            const recruiterId = (await Recruiter.findOne({ email }).lean())._id.toString();
            await Login.create({
                email,
                password: hashPassword,
                role: "RECRUITER",
                userId: recruiterId
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
            console.log(error);
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
            console.log(error);
            throw error;
        }
    }

    static login = async ({ email, password }) => {
        try {
            //check Exist
            const user = await Login.findOne({ email }).lean();
            if (!user) {
                throw new BadRequestError('Tài khoản không tồn tại')
            }
            //check Password
            const passwordValid = await bcrypt.compare(password, user.password);
            if (!passwordValid) {
                throw new BadRequestError('Mật khẩu không chính xác')
            }
            // sigb AT & RT
            const accessToken = await JWTService.signAccessToken(user.userId.toString());
            const refreshToken = await JWTService.signRefreshToken(user.userId.toString());
            //return 200
            return {
                message: "Đăng nhập thành công",
                metadata: {
                    user: {
                        Id: user._id.toString(),
                        email: user.email,
                        role: user.role
                    },
                    tokens: {
                        accessToken,
                        refreshToken
                    }
                }
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

module.exports = AccessService;
