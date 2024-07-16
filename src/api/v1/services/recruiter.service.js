const { InternalServerError, ConflictRequestError, BadRequestError, NotFoundRequestError } = require("../core/error.response");
const { Application } = require("../models/application.model");
const { Job } = require("../models/job.model");
const { Login } = require("../models/login.model");
const { Notification } = require("../models/notification.model");
const { Order } = require("../models/order.model");
const { OTP } = require("../models/otp.model");
const { Recruiter } = require("../models/recruiter.model");
const { status, applicationStatus, mapRolePermission } = require("../utils");
const bcrypt = require('bcryptjs');
const RedisService = require("./redis.service");
const EmailService = require("./email.service");
const OTPService = require("./otp.service");
const { clearImage } = require('../utils/processImage');
const mongoose = require('mongoose');
const ApplicationService = require("./application.service");
const FavoriteRecruiterService = require("./favoriteRecruiter.service");
const { formatInTimeZone } = require("date-fns-tz");
const socketService = require("./socket.service");
const { RecruiterPostLimit } = require("../models/recruiterPostLimit.model");
const { FavoriteRecruiter } = require("../models/favoriteRecruiter.model");
const ReportService = require("./report.service");
require('dotenv').config();


class RecruiterService {

    static signUp = async ({ companyName, name, position, phone, contactEmail, email, password }) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            // check user exist by mail
            const isExist = await Login.findOne({ email });
            if (isExist) {
                throw new ConflictRequestError('Email này đã được sử dụng vui lòng nhập email khác');
            }
            // check sign up but not verify
            const recruiter = await Recruiter.findOne({ email }).lean();
            if (recruiter) {
                // check otp exist
                const otpHolder = await OTP.find({ email });
                if (otpHolder.length) {
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
            const newRecruiter = await Recruiter.create([{
                companyName, name, position, phone, contactEmail, email
            }], {
                session
            })
            if (!newRecruiter) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            await EmailService.sendSignUpMail({ toEmail: email, userName: newRecruiter[0].name, code: mapRolePermission["RECRUITER"] });
            await session.commitTransaction();
            session.endSession();
            return {
                message: "Đăng ký tài khoản thành công",
                metadata: {
                    sender: process.env.MAIL_SEND
                }
            }
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    static verifyEmail = async (email, otp) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            // get last otp
            const otpHolder = await OTP.find({ email });
            if (!otpHolder.length) {
                throw new NotFoundRequestError('OTP hết hạn vui lòng làm mới');
            }
            const lastOtp = otpHolder[otpHolder.length - 1].otp;
            // verify otp
            const isValid = await OTPService.validOtp(otp, lastOtp);
            if (!isValid) {
                throw new BadRequestError('OTP không chính xác')
            }
            // add recruiter to login
            const hashPassword = await RedisService.getEmailKey(email);
            if (!hashPassword) {
                throw new BadRequestError("Quá thời hạn 24 giờ kể từ lúc đăng ký vui lòng đăng ký lại.");
            }
            const login = await Login.create([{
                email,
                password: hashPassword,
                role: "RECRUITER",
            }], {
                session
            })
            // verify Email, reference Recruiter, Login
            const result = await Recruiter.findOneAndUpdate({ email }, {
                $set: {
                    verifyEmail: true, loginId: login[0]._id
                }
            }, {
                session,
                new: true
            })
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại');
            }
            // delete redis password
            await RedisService.deleteEmailKey(email);
            // delete all otp verify in db
            await OTP.deleteMany({ email }, { session });
            await session.commitTransaction();
            session.endSession();
            //return 200
            return {
                message: "Xác nhận email thành công",
            }
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    static resendVerifyEmail = async ({ email }) => {
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
            const password = await RedisService.getEmailKey(email);
            if (!password) {
                throw new BadRequestError("Quá thời hạn 24 giờ kể từ lúc đăng ký vui lòng đăng ký lại.");
            }
            await RedisService.setPassword(email, password);
            await EmailService.sendSignUpMail({ toEmail: email, userName: recruiter.name });
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

    static getInformation = async ({ userId }) => {
        try {
            const recruiterInfor = await Recruiter.findById(userId).populate("loginId").lean().select(
                '-createdAt -updatedAt -__v'
            );
            if (!recruiterInfor) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            const recruiterPostLimit = await RecruiterPostLimit.findOne({ recruiter: userId }).lean();
            const premiumAccount = await Order.checkPremiumAccount({ recruiterId: userId });
            const recruiterBannedJobCount = await ReportService.recruiterBannedJobCount({ recruiterId: userId });
            let limitPost;
            if (premiumAccount) {
                recruiterBannedJobCount === 2 ? limitPost = 8 : limitPost = 10;
            } else {
                recruiterBannedJobCount === 2 ? limitPost = 2 : limitPost = 3;
            }
            const likeNumber = await FavoriteRecruiterService.getLikeNumber({ recruiterId: userId });
            recruiterInfor.role = recruiterInfor.loginId?.role;
            delete recruiterInfor.loginId;
            recruiterInfor.avatar = recruiterInfor.avatar ?? null;
            recruiterInfor.companyLogo = recruiterInfor.companyLogo ?? null;
            recruiterInfor.companyCoverPhoto = recruiterInfor.companyCoverPhoto ?? null;
            recruiterInfor.slug = recruiterInfor.slug ?? null;
            recruiterInfor.likeNumber = likeNumber;
            recruiterInfor.postCount = recruiterPostLimit?.postCount ?? 0;
            recruiterInfor.limitPost = limitPost;
            recruiterInfor.reasonDecline = recruiterInfor.reasonDecline ?? null;
            return {
                message: "Lấy thông tin thành công",
                metadata: { ...recruiterInfor }
            }
        } catch (error) {
            throw error;
        }
    }

    static updateInformation = async ({ userId, name, position, phone, contactEmail, companyName, companyWebsite,
        companyAddress, companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug }) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            //check slug
            const recruiter = await Recruiter.findOne({ slug }).lean();
            if (recruiter) {
                if (recruiter._id.toString() !== userId) {
                    throw new BadRequestError("Slug này đã tồn tại. Vui lòng nhập slug khác.");
                }
            }
            const result = await Recruiter.findOneAndUpdate({ _id: userId }, {
                $set: {
                    name, position, phone, contactEmail, companyName, companyWebsite, companyAddress,
                    about, employeeNumber, fieldOfActivity, companyLogo, companyCoverPhoto, slug,
                    acceptanceStatus: "waiting", firstUpdate: false
                }
            }, {
                session,
                new: true,
                select: { __v: 0 }
            }).populate('loginId').lean()
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại');
            }
            result.role = result.loginId?.role;
            delete result.loginId;
            result.avatar = result.avatar ?? null;
            await session.commitTransaction();
            session.endSession();
            return {
                message: "cập nhật thông tin thành công",
                metadata: { ...result }
            }
        } catch (error) {
            if (companyLogo) {
                const splitArr = companyLogo.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            if (companyCoverPhoto) {
                const splitArr = companyCoverPhoto.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    static updateAvatar = async ({ userId, avatar }) => {
        try {
            const recruiter = await Recruiter.findById(userId);
            const oldAvatar = recruiter.avatar;
            if (oldAvatar) {
                const splitArr = oldAvatar.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            recruiter.avatar = avatar;
            await recruiter.save();
            const result = await Recruiter.findById(userId).populate("loginId").select("-__v").lean();
            result.role = result.loginId.role;
            delete result.loginId;
            result.slug = result.slug ?? null;
            result.companyLogo = result.companyLogo ?? null;
            result.companyCoverPhoto = result.companyCoverPhoto ?? null;
            return {
                message: "cập nhật ảnh đại diện thành công",
                metadata: { ...result }
            }
        } catch (error) {
            throw error;
        }
    }

    static updateProfile = async ({ userId, name, position, phone, contactEmail }) => {
        try {
            const recruiter = await Recruiter.findById(userId)
                .select("-__v -_id -loginId -verifyEmail -firstApproval -firstUpdate -createdAt -updatedAt -acceptanceStatus").lean();
            let result;
            if (!recruiter.oldInfo?.name) {
                result = await Recruiter.findOneAndUpdate({ _id: userId }, {
                    $set: {
                        name, position, phone, contactEmail,
                        acceptanceStatus: "waiting", oldInfo: { ...recruiter }
                    }
                }, {
                    new: true,
                    select: { createdAt: 0, updatedAt: 0, __v: 0 }
                }).lean().populate('loginId')
            } else {
                result = await Recruiter.findOneAndUpdate({ _id: userId }, {
                    $set: {
                        name, position, phone, contactEmail,
                        acceptanceStatus: "waiting"
                    }
                }, {
                    new: true,
                    select: { createdAt: 0, updatedAt: 0, __v: 0 }
                }).lean().populate('loginId')
            }
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại');
            }
            result.role = result.loginId.role;
            delete result.loginId;
            result.avatar = result.avatar ?? null;
            result.slug = result.slug ?? null;
            result.companyLogo = result.companyLogo ?? null;
            result.companyCoverPhoto = result.companyCoverPhoto ?? null;
            return {
                message: "cập nhật thông tin thành công",
                metadata: { ...result }
            }
        } catch (error) {
            throw error;
        }
    }

    static updateCompany = async ({ userId, companyName, companyWebsite, companyAddress,
        companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug }) => {
        try {
            //check slug
            if (slug) {
                const recruiterSlug = await Recruiter.findOne({ slug }).lean();
                if (recruiterSlug) {
                    if (recruiterSlug._id.toString() !== userId) {
                        throw new BadRequestError("Slug này đã tồn tại. Vui lòng nhập slug khác.");
                    }
                }
            }
            const recruiter = await Recruiter.findById(userId)
                .select("-__v -_id -loginId -verifyEmail -firstApproval -firstUpdate -createdAt -updatedAt -acceptanceStatus").lean();
            let result;
            if (!recruiter.oldInfo?.name) {
                result = await Recruiter.findByIdAndUpdate(userId, {
                    $set: {
                        companyName, companyWebsite, companyAddress, about, employeeNumber, fieldOfActivity, slug,
                        acceptanceStatus: "waiting", companyLogo, companyCoverPhoto, oldInfo: { ...recruiter }
                    }
                }, {
                    new: true,
                    select: { __v: 0 }
                }).populate('loginId').lean()
            } else {
                if (companyLogo) {
                    if (companyLogo !== recruiter.companyLogo && recruiter.companyLogo !== recruiter.oldInfo.companyLogo) {
                        const splitArr = companyLogo.split("/");
                        const image = splitArr[splitArr.length - 1];
                        clearImage(image);
                    }
                }
                if (companyCoverPhoto) {
                    if (companyCoverPhoto !== recruiter.companyCoverPhoto && recruiter.companyCoverPhoto !== recruiter.oldInfo.companyCoverPhoto) {
                        const splitArr = companyCoverPhoto.split("/");
                        const image = splitArr[splitArr.length - 1];
                        clearImage(image);
                    }
                }
                result = await Recruiter.findByIdAndUpdate(userId, {
                    $set: {
                        companyName, companyWebsite, companyAddress, about, employeeNumber, fieldOfActivity, slug,
                        acceptanceStatus: "waiting", companyLogo, companyCoverPhoto
                    }
                }, {
                    new: true,
                    select: { __v: 0 }
                }).populate('loginId').lean()
            }
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            result.role = result.loginId.role;
            delete result.loginId;
            result.avatar = result.avatar ?? null;
            result.slug = result.slug ?? null;
            result.companyLogo = result.companyLogo ?? null;
            result.companyCoverPhoto = result.companyCoverPhoto ?? null;
            return {
                message: "cập nhật thông tin thành công",
                metadata: { ...result }
            }
        } catch (error) {
            if (companyLogo) {
                const splitArr = companyLogo.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            if (companyCoverPhoto) {
                const splitArr = companyCoverPhoto.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            throw error;
        }
    }

    static changePassword = async ({ userId, currentPassword, newPassword }) => {
        try {
            const email = (await Recruiter.findById(userId).lean()).email;
            const { message } = await Login.changePassword({ email, currentPassword, newPassword });
            return {
                message: message
            }
        } catch (error) {
            throw error;
        }
    }

    static getListRecruiterHomePage = async ({ searchText, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            let query = {
                firstApproval: false
            };
            let listRecruiter;
            if (searchText) {
                query["$text"] = { $search: searchText };
            }
            listRecruiter = await Recruiter.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: 'orders',
                        let: { recruiterId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$recruiterId', '$$recruiterId'] }, // id từ order, recruiter
                                            { $eq: ['$status', 'Thành công'] },
                                            { $gt: ['$validTo', new Date()] }
                                        ]
                                    }
                                }
                            },
                            { $project: { _id: 1 } }
                        ],
                        as: 'premiumDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'favoriterecruiters',
                        let: { recruiterId: { $toString: '$_id' } },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$$recruiterId', '$favoriteRecruiters']
                                    }
                                }
                            },
                            { $count: 'likeNumber' }
                        ],
                        as: 'likeDetails'
                    }
                },
                {
                    $addFields: {
                        premiumAccount: { $gt: [{ $size: '$premiumDetails' }, 0] }, // > 0 thì true
                        likeNumber: { $ifNull: [{ $arrayElemAt: ['$likeDetails.likeNumber', 0] }, 0] } // null thì lấy 0
                    }
                },
                { $sort: { premiumAccount: -1, likeNumber: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
                {
                    $project: {
                        __v: 0,
                        loginId: 0,
                        avatar: 0,
                        premiumDetails: 0,
                        likeDetails: 0
                    }
                }
            ]);
            const totalElement = await Recruiter.find(query).lean().countDocuments();
            if (listRecruiter.length !== 0) {
                listRecruiter = listRecruiter.map(recruiter => {
                    if (recruiter.oldInfo?.name) {
                        recruiter = { ...recruiter, ...recruiter.oldInfo }
                    }
                    return recruiter;
                })
            }
            return {
                message: "Lấy danh sách nhà tuyển dụng thành công",
                metadata: {
                    listRecruiter: listRecruiter,
                    totalElement: totalElement
                },
                options: {
                    page: page,
                    limit: limit
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static getInformationBySlug = async ({ slug }) => {
        try {
            let recruiterInfor = await Recruiter.findOne({ slug }).lean().select(
                '-roles -createdAt -updatedAt -__v -acceptanceStatus -verifyEmail -firstApproval -loginId -avatar'
            );
            if (!recruiterInfor) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            const likeNumber = await FavoriteRecruiterService.getLikeNumber({ recruiterId: recruiterInfor._id.toString() });
            if (recruiterInfor.oldInfo?.name) {
                recruiterInfor = { ...recruiterInfor, ...recruiterInfor.oldInfo }
            }
            recruiterInfor.companyLogo = recruiterInfor.companyLogo ?? null;
            recruiterInfor.companyCoverPhoto = recruiterInfor.companyCoverPhoto ?? null;
            recruiterInfor.slug = recruiterInfor.slug ?? null;
            recruiterInfor.likeNumber = likeNumber;
            return {
                message: "Lấy thông tin nhà tuyển dụng thành công",
                metadata: {
                    ...recruiterInfor
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static getListRelatedRecruiter = async ({ recruiterId, searchText, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const recruiter = await Recruiter.findById(recruiterId).lean();
            if (!recruiter) {
                throw new BadRequestError("Có lỗi xảy ra vui lòng thử lại.");
            }
            const field = recruiter.fieldOfActivity;
            let query = {
                _id: { $ne: recruiterId },
                fieldOfActivity: { $in: field },
                acceptanceStatus: "accept"
            };
            let listRecruiter;
            if (searchText) {
                query["$text"] = { $search: searchText };
                listRecruiter = await Recruiter.find(query, { score: { $meta: "textScore" } })
                    .lean()
                    .select("-createdAt -updatedAt -__v -loginId")
                    .sort({ score: { $meta: "textScore" } })
                    .skip((page - 1) * limit)
                    .limit(limit);
            } else {
                listRecruiter = await Recruiter.find(query)
                    .lean()
                    .select("-createdAt -updatedAt -__v -loginId")
                    .sort({ updatedAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit);
            }
            const totalElement = await Recruiter.find(query).lean().countDocuments();
            if (listRecruiter.length !== 0) {
                listRecruiter = await Promise.all(
                    listRecruiter.map(async (recruiter) => {
                        const activeJobCount = await Job.find({
                            status: "active", acceptanceStatus: "accept",
                            recruiterId: recruiter._id.toString()
                        }).countDocuments();
                        return {
                            ...recruiter,
                            activeJobCount,
                            companyLogo: recruiter.companyLogo,
                            companyCoverPhoto: recruiter.companyCoverPhoto
                        }
                    })
                )
            }
            return {
                message: "Lấy danh sách nhà tuyển dụng liên quan thành công",
                metadata: {
                    listRecruiter, totalElement
                }
            }
        } catch (error) {
            throw error;
        }
    }

    // Tạo công việc
    static createJob = async ({ userId, name, location, province, type, levelRequirement, experience, salary,
        field, description, requirement, benefit, quantity, deadline, gender }) => {
        try {
            // Check premium account
            const premiumAccount = await Order.checkPremiumAccount({ recruiterId: userId });
            // Check số công việc bị ban
            const recruiterBannedJobCount = await ReportService.recruiterBannedJobCount({ recruiterId: userId });
            let limitPost;
            if (premiumAccount) {
                recruiterBannedJobCount === 2 ? limitPost = 8 : limitPost = 10;
            } else {
                recruiterBannedJobCount === 2 ? limitPost = 2 : limitPost = 3;
            }
            // Check limit post
            const recruiterLimitPost = await RecruiterPostLimit.findOne({ recruiterId: userId });
            if (recruiterLimitPost.postCount >= limitPost) {
                throw new BadRequestError(`Bạn đã đạt giới hạn số bài đăng tuyển dụng trong tháng là: ${limitPost} bài.`);
            }
            const result = await Job.create({
                name, location, province, type, levelRequirement, experience, salary, field, description,
                requirement, benefit, quantity, deadline, gender, recruiterId: userId
            })
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại.');
            }
            // Cập nhật số lượng bài đăng
            const isUpdate = await RecruiterPostLimit.findOneAndUpdate({ recruiterId: userId }, {
                $inc: { postCount: 1 }
            }, {
                new: true
            })
            if (!isUpdate) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại.');
            }
            // Thông báo tới ứng viên yêu thích nhà tuyển dụng
            const userSockets = socketService.getUserSockets();
            const listCandidate = await FavoriteRecruiter.find({ favoriteRecruiters: userId.toString() }).lean();
            const recruiter = await Recruiter.findById(userId).lean();
            if (listCandidate.length !== 0) {
                for (let i = 0; i < listCandidate.length; i++) {
                    const notificationCandidate = await Notification.create({
                        senderId: userId,
                        receiverId: listCandidate[i].candidateId,
                        senderCode: mapRolePermission["RECRUITER"],
                        link: `${process.env.FE_URL}/jobs/${result._id.toString()}`,
                        title: "Nhà tuyển dụng đã đăng việc làm mới.",
                        content: `${recruiter.companyName} vừa đăng tải tin tuyển dụng mới. Vào xem ngay!`
                    })
                    if (!notificationCandidate) {
                        throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
                    }
                    const socketId = userSockets.get(listCandidate[i].candidateId.toString());
                    if (socketId) {
                        _io.to(socketId).emit('user_notification', notificationCandidate);
                        console.log(`Notification sent to user ${listCandidate[i].candidateId}: ${notificationCandidate}`);
                    }
                }
            }
            const returnResult = result.toObject();
            delete returnResult.recruiterId;
            delete returnResult.createdAt;
            delete returnResult.updatedAt;
            delete returnResult.__v;
            return {
                message: "Tạo công việc thành công",
                metadata: { ...returnResult }
            }
        } catch (error) {
            throw error;
        }
    }

    static updateJob = async ({ userId, jobId, name, location, province, type, levelRequirement, experience, salary,
        field, description, requirement, benefit, quantity, deadline, gender }) => {
        try {
            const job = await Job.findOneAndUpdate({ _id: jobId, recruiterId: userId }, {
                $set: {
                    name, location, province, type, levelRequirement, experience, salary,
                    field, description, requirement, benefit, quantity, deadline, gender
                }
            }, {
                new: true,
                select: { __v: 0, recruiterId: 0 }
            }).lean()
            if (!job) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            return {
                message: "Cập nhật công việc thành công",
                metadata: { ...job }
            }
        } catch (error) {
            throw error;
        }
    }

    static getJobStatus = async () => {
        try {
            const listStatus = status;
            return {
                message: "Lấy danh sách trạng thái công việc thành công",
                metadata: { listStatus }
            }
        } catch (error) {
            throw error;
        }
    }

    static changeJobStatus = async ({ userId, jobId, status }) => {
        try {
            const job = await Job.findOneAndUpdate({ _id: jobId, recruiterId: userId }, {
                $set: {
                    status
                }
            }, {
                new: true,
                select: { __v: 0, recruiterId: 0 }
            }).lean()
            if (!job) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            return {
                message: "Thay đổi trạng thái công việc thành công",
                metadata: { ...job }
            }
        } catch (error) {
            throw error;
        }
    }

    static approveApplication = async ({ userId, applicationId, status, reasonDecline }) => {
        try {
            const companyName = (await Recruiter.findById(userId).lean()).companyName;
            // validate application
            const { result, jobId, jobName, quantity } = await ApplicationService.getApplicationDetail({ applicationId });
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            // validate quantity
            let application;
            const acceptedNumber = await ApplicationService.getJobAcceptedApplicationNumber({ jobId });
            if (status === "Đã nhận") {
                if (quantity !== 'o') {
                    if (acceptedNumber >= +quantity) {
                        throw new BadRequestError("Đã đủ số lượng cần tuyển, không thể nhận thêm!");
                    }
                }
                application = await Application.findOneAndUpdate({ _id: applicationId }, {
                    $set: {
                        status, reasonDecline: null
                    }
                }, {
                    new: true
                }).lean()

            } else {
                application = await Application.findOneAndUpdate({ _id: applicationId }, {
                    $set: {
                        status, reasonDecline
                    }
                }, {
                    new: true
                }).lean()
            }
            if (!application) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            // Gửi email thông báo cho ứng viên
            await EmailService.sendApplicationResultMail({ toEmail: result.email, userName: result.name, jobName, result: status });
            // Thông báo tới ứng viên
            const notification = await Notification.create({
                senderId: userId,
                receiverId: application.candidateId.toString(),
                senderCode: mapRolePermission["RECRUITER"],
                link: `${process.env.FE_URL}/profile/submitted-jobs`,
                title: `${companyName} đã duyệt đơn ứng tuyển của bạn.`,
                content: `Đơn ứng tuyển công việc '${jobName}' đã được duyệt.`
            })
            if (!notification) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            const userSockets = socketService.getUserSockets();
            const socketId = userSockets.get(application.candidateId.toString());
            if (socketId) {
                _io.to(socketId).emit('user_notification', notification);
                console.log(`Notification sent to user ${application.candidateId.toString()}: ${notification}`);
            }
            return {
                message: "Duyệt đơn ứng tuyển thành công thành công",
            }
        } catch (error) {
            throw error;
        }
    }

    static getListApplicationStatus = async () => {
        try {
            return {
                message: "Lấy danh sách trạng thái ứng tuyển thành công",
                metadata: { applicationStatus }
            }
        } catch (error) {
            throw error;
        }
    }

    static checkPremiumAccount = async ({ userId }) => {
        try {
            const premiumAccount = await Order.checkPremiumAccount({ recruiterId: userId });
            return {
                message: "Kiểm tra tài khoản thành công",
                metadata: {
                    premiumAccount
                }
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RecruiterService;
