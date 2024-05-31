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
const OrderService = require("./order.service");
const VNPayService = require("./vnpay.service");
const RedisService = require("./redis.service");
const EmailService = require("./email.service");
const OTPService = require("./otp.service");
const { FavoriteRecruiter } = require("../models/favoriteRecruiter.model");
const { clearImage } = require('../utils/processImage');
const mongoose = require('mongoose');


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
            // verify Email
            await Recruiter.verifyEmail(email, session);
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
            // Reference Recruiter, Login
            await Recruiter.findOneAndUpdate({ email }, {
                $set: {
                    loginId: login[0]._id
                }
            }, {
                session
            })
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
            const recruiter = await Recruiter.getInformation(userId);
            return {
                message: "Lấy thông tin thành công",
                metadata: { ...recruiter }
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
            console.log(result)
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
            const result = await Recruiter.findOneAndUpdate({ _id: userId }, {
                $set: {
                    name, position, phone, contactEmail,
                    acceptanceStatus: "waiting"
                }
            }, {
                new: true,
                select: { createdAt: 0, updatedAt: 0, __v: 0 }
            }).lean().populate('loginId')
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
            const recruiter = await Recruiter.findById(userId);
            if (companyLogo) {
                const oldLogo = recruiter.companyLogo;
                if (oldLogo) {
                    const splitArrLogo = oldLogo.split("/");
                    const deleteLogo = splitArrLogo[splitArrLogo.length - 1];
                    clearImage(deleteLogo);
                }
                recruiter.companyLogo = companyLogo;
            }
            if (companyCoverPhoto) {
                const oldCP = recruiter.companyCoverPhoto;
                if (oldCP) {
                    const splitArrCP = oldCP.split("/");
                    const deleteCP = splitArrCP[splitArrCP.length - 1];
                    clearImage(deleteCP);
                }
                recruiter.companyCoverPhoto = companyCoverPhoto;
            }
            if (companyName) {
                recruiter.companyName = companyName;
            }
            if (companyWebsite) {
                recruiter.companyWebsite = companyWebsite;
            }
            if (companyAddress) {
                recruiter.companyAddress = companyAddress;
            }
            if (about) {
                recruiter.about = about;
            }
            if (employeeNumber) {
                recruiter.employeeNumber = employeeNumber;
            }
            if (fieldOfActivity) {
                recruiter.fieldOfActivity = fieldOfActivity;
            }
            if (slug) {
                recruiter.slug = slug;
            }
            recruiter.acceptanceStatus = "waiting";
            await recruiter.save();
            const result = await Recruiter.findById(userId).populate('loginId').select("-__v").lean();
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
                firstApproval: false,
                acceptanceStatus: "accept"
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
                    return {
                        ...recruiter,
                        companyLogo: recruiter.companyLogo?.url,
                        companyCoverPhoto: recruiter.companyCoverPhoto?.url
                    }
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
            const recruiterInfor = await Recruiter.findOne({ slug, acceptanceStatus: "accept" }).lean().select(
                '-roles -createdAt -updatedAt -__v -acceptanceStatus -verifyEmail -firstApproval -loginId -avatar'
            );
            if (!recruiterInfor) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            const likeNumber = await FavoriteRecruiter.getLikeNumber({ recruiterId: recruiterInfor._id.toString() });
            recruiterInfor.companyLogo = recruiterInfor.companyLogo?.url ?? null;
            recruiterInfor.companyCoverPhoto = recruiterInfor.companyCoverPhoto?.url ?? null;
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
                listRecruiter = listRecruiter.map(recruiter => {
                    return {
                        ...recruiter,
                        companyLogo: recruiter.companyLogo?.url,
                        companyCoverPhoto: recruiter.companyCoverPhoto?.url
                    }
                })
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

    static createJob = async ({ userId, name, location, province, type, levelRequirement, experience, salary,
        field, description, requirement, benefit, quantity, deadline, gender }) => {
        try {
            const result = await Job.create({
                userId, name, location, province, type, levelRequirement, experience, salary, field, description,
                requirement, benefit, quantity, deadline, gender, recruiterId: userId
            })
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra');
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
            const job = await Job.updateJob({
                userId, jobId, name, location, province, type, levelRequirement, experience, salary,
                field, description, requirement, benefit, quantity, deadline, gender
            })
            return {
                message: "Cập nhật công việc thành công",
                metadata: { ...job }
            }
        } catch (error) {
            throw error;
        }
    }

    static getJobDetail = async ({ userId, jobId }) => {
        try {
            const job = await Job.getJobDetailByRecruiter({ userId, jobId })
            return {
                message: "Lấy thông tin công việc thành công",
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
            const job = await Job.changeJobStatus({ userId, jobId, status })
            return {
                message: "Thay đổi trạng thái công việc thành công",
                metadata: { ...job }
            }
        } catch (error) {
            throw error;
        }
    }

    static getListWaitingJob = async ({ userId, name, field, levelRequirement, status, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { mappedList, length } = await Job.getListWaitingJobByRecruiterId({ userId, name, field, levelRequirement, status, page, limit })
            return {
                message: "Lấy danh sách công việc thành công",
                metadata: {
                    listWaitingJob: mappedList,
                    totalElement: length
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

    static getListAcceptedJob = async ({ userId, name, field, levelRequirement, status, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { mappedList, length } = await Job.getListAcceptedJobByRecruiterId({ userId, name, field, levelRequirement, status, page, limit })
            return {
                message: "Lấy danh sách công việc thành công",
                metadata: {
                    listAcceptedJob: mappedList,
                    totalElement: length
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

    static getListDeclinedJob = async ({ userId, name, field, levelRequirement, status, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { mappedList, length } = await Job.getListDeclinedJobByRecruiterId({ userId, name, field, levelRequirement, status, page, limit })
            return {
                message: "Lấy danh sách công việc thành công",
                metadata: {
                    listDeclinedJob: mappedList,
                    totalElement: length
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

    static getListNearingExpirationdJob = async ({ userId, name, field, levelRequirement, status, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { mappedList, length } = await Job.getListNearingExpirationdJobByRecruiterId({ userId, name, field, levelRequirement, status, page, limit })
            return {
                message: "Lấy danh sách công việc sắp hết hạn thành công",
                metadata: {
                    listNearingExpirationJob: mappedList,
                    totalElement: length
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

    static getListExpiredJob = async ({ userId, name, field, levelRequirement, status, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { mappedList, length } = await Job.getListExpiredJobByRecruiterId({ userId, name, field, levelRequirement, status, page, limit })
            return {
                message: "Lấy danh sách công việc đã hết hạn thành công",
                metadata: {
                    listExpiredJob: mappedList,
                    totalElement: length
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

    static getListJobApplicationExperience = async ({ userId, jobId }) => {
        try {
            const job = await Job.findById(jobId).lean();
            if (!job) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            const listExperience = await Application.getListJobApplicationExperience({ userId, jobId })
            return {
                message: "Lấy danh sách kinh nghiệm thành công",
                metadata: {
                    listExperience
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static getListJobApplication = async ({ userId, jobId, candidateName, experience, status, major, goal,
        page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const job = await Job.findById(jobId).lean();
            if (!job) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            const { listApplication, totalElement } = await Application.getListJobApplication({
                userId, jobId, candidateName, experience, status, major, goal,
                page, limit
            })
            return {
                message: "Lấy danh sách ứng tuyển thành công",
                metadata: {
                    listApplication,
                    totalElement,
                    name: job.name,
                    levelRequirement: job.levelRequirement
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

    static getApplicationDetail = async ({ userId, applicationId }) => {
        try {
            const { result } = await Application.getApplicationDetail({ userId, applicationId });
            return {
                message: "Lấy thông tin resume thành công",
                metadata: {
                    ...result
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static approveApplication = async ({ userId, applicationId, status, reasonDecline }) => {
        try {
            const companyName = (await Recruiter.findById(userId).lean()).companyName;
            const { candidateId, jobName } = await Application.approveApplication({ userId, applicationId, status, reasonDecline });
            const notification = await Notification.create({
                senderId: userId,
                receiverId: candidateId,
                senderCode: mapRolePermission["RECRUITER"],
                link: `${process.env.FE_URL}/profile/submitted-jobs`,
                title: `${companyName} đã duyệt đơn ứng tuyển của bạn.`,
                content: `Đơn ứng tuyển công việc '${jobName}' đã được duyệt.`
            })
            if (!notification) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            _io.emit(`notification_candidate_${candidateId}`, notification);
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

    static getListNotification = async ({ userId }) => {
        try {
            const listNotification = await Notification.getListNotification({ userId })
            return {
                message: "Lấy danh sách thông báo thành công",
                metadata: { listNotification }
            }
        } catch (error) {
            throw error;
        }
    }

    static readNotification = async ({ userId, notificationId }) => {
        try {
            await Notification.readNotification({ userId, notificationId })
            return {
                message: "Đọc thông báo thành công"
            }
        } catch (error) {
            throw error;
        }
    }

    static getListJobApplication = async ({ userId, jobId, candidateName, experience, status, major, goal,
        page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const job = await Job.findById(jobId).lean();
            if (!job) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            const { listApplication, totalElement } = await Application.getListJobApplication({
                userId, jobId, candidateName, experience, status, major, goal,
                page, limit
            })
            const acceptedNumber = await Application.getJobAcceptedApplicationNumber({ jobId });
            return {
                message: "Lấy danh sách ứng tuyển thành công",
                metadata: {
                    listApplication,
                    totalElement,
                    name: job.name,
                    quantity: job.quantity,
                    acceptedNumber,
                    levelRequirement: job.levelRequirement
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

    static createPayment = async ({ userId, orderType, language, ipAddr }) => {
        try {
            const order = await OrderService.createOrder({ userId, price: 600000 });
            const vpnUrl = await VNPayService.createPaymentURL({ ipAddr, orderId: order._id.toString(), amount: 600000, orderType, language });
            return {
                message: "Tạo đơn thanh toán thành công",
                metadata: { vpnUrl }
            };
        } catch (error) {
            throw error;
        }
    }

    static getVNPayIPN = async ({ reqQuery }) => {
        try {
            const { message, code, result } = await VNPayService.getVNPayIPN({ reqQuery });
            return {
                message,
                metadata: { code, result }
            };
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
