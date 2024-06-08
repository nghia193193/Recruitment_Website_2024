const { Candidate } = require("../models/candidate.model");
const { Resume } = require("../models/resume.model");
const { Login } = require("../models/login.model");
const { InternalServerError, BadRequestError, ConflictRequestError, NotFoundRequestError } = require("../core/error.response");
const { Application } = require("../models/application.model");
const { Job } = require("../models/job.model");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const { formatInTimeZone } = require("date-fns-tz");
const { Notification } = require("../models/notification.model");
const { OTP } = require("../models/otp.model");
const RedisService = require("./redis.service");
const OTPService = require("./otp.service");
const EmailService = require("./email.service");
const { mapRolePermission } = require("../utils");
const ObjectId = mongoose.Types.ObjectId;
const { clearImage } = require('../utils/processImage');
const FavoriteRecruiterService = require("./favoriteRecruiter.service");
const FavoriteJobService = require("./favoriteJob.service");

class CandidateService {
    static signUp = async ({ name, email, password }) => {
        try {
            // check user exist by mail
            const isExist = await Login.findOne({ email });
            if (isExist) {
                throw new ConflictRequestError('Email này đã được sử dụng vui lòng nhập email khác');
            }
            // check sign up but not verify
            const candidate = await Candidate.findOne({ email }).lean();
            if (candidate) {
                // check otp
                const otpHolder = await OTP.find({ email });
                if (otpHolder.length) {
                    throw new BadRequestError('Email này đã được đăng ký, vui lòng truy cập email để xác nhận tài khoản');
                }
                // otp expired allowed user to Resignup
                await Candidate.findOneAndDelete({ email });
            }
            // user not exist create new user
            // hash password
            const hashPassword = await bcrypt.hash(password, 10);
            await RedisService.setPassword(email, hashPassword);
            // create recruiter
            const newCandidate = await Candidate.create({ name, email })
            await EmailService.sendSignUpMail({ toEmail: email, userName: newCandidate.name, code: mapRolePermission["CANDIDATE"] });
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

    static verifyEmail = async (email, otp) => {
        try {
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
            const result = await Candidate.findOneAndUpdate({ email }, {
                $set: {
                    verifyEmail: true
                }
            }, {
                new: true
            })
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại');
            }
            // add recruiter to login
            const hashPassword = await RedisService.getEmailKey(email);
            if (!hashPassword) {
                throw new BadRequestError("Quá thời hạn 24 giờ kể từ lúc đăng ký vui lòng đăng ký lại.");
            }
            const login = await Login.create({
                email,
                password: hashPassword,
                role: "CANDIDATE",
            })
            // Reference Candidate, Login
            await Candidate.findOneAndUpdate({ email }, {
                $set: {
                    loginId: login._id
                }
            })
            // delete redis password
            await RedisService.deleteEmailKey(email);
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

    static resendVerifyEmail = async ({ email }) => {
        try {
            // check user exist
            const candidate = await Candidate.findOne({ email }).lean();
            if (!candidate) {
                throw new BadRequestError('Email không tồn tại');
            }
            if (candidate.verifyEmail === true) {
                throw new BadRequestError('Email của bạn đã được xác nhận');
            }
            // refresh ttl redis password
            const password = await RedisService.getEmailKey(email);
            if (!password) {
                throw new BadRequestError("Quá thời hạn 24 giờ kể từ lúc đăng ký vui lòng đăng ký lại.");
            }
            await RedisService.setPassword(email, password);
            await EmailService.sendSignUpMail({ toEmail: email, userName: candidate.name });
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
            const candidateInfor = await Candidate.findById(userId).populate("loginId").lean().select(
                '-createdAt -updatedAt -__v'
            );
            if (!candidateInfor) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            const list = await Resume.find({ candidateId: userId, allowSearch: true }).lean().select("_id");
            const listAllowSearchResume = list.map(resume => resume._id);
            candidateInfor.role = candidateInfor.loginId?.role;
            delete candidateInfor.loginId;
            candidateInfor.avatar = candidateInfor.avatar ?? null;
            candidateInfor.phone = candidateInfor.phone ?? null;
            candidateInfor.gender = candidateInfor.gender ?? null;
            candidateInfor.homeTown = candidateInfor.homeTown ?? null;
            candidateInfor.workStatus = candidateInfor.workStatus ?? null;
            candidateInfor.dateOfBirth = candidateInfor.dateOfBirth ?? null;
            candidateInfor.listAllowSearchResume = listAllowSearchResume;
            return {
                message: "Lấy thông tin thành công",
                metadata: { ...candidateInfor }
            }
        } catch (error) {
            throw error;
        }
    }

    static updateInformation = async ({ userId, name, phone, gender, homeTown, workStatus, dateOfBirth,
        allowSearch, listResume }) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const result = await Candidate.findOneAndUpdate({ _id: userId }, {
                $set: {
                    name, phone, gender, homeTown, workStatus, dateOfBirth, allowSearch
                }
            }, {
                session,
                new: true,
                select: { createdAt: 0, updatedAt: 0, __v: 0 }
            }).lean().populate('loginId')
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại');
            }
            if (allowSearch) {
                if (allowSearch === "true") {
                    if (listResume.length !== 0) {
                        await Resume.updateMany({ candidateId: userId }, {
                            $set: {
                                allowSearch: false
                            }
                        }, {
                            session
                        })
                        for (let i = 0; i < listResume.length; i++) {
                            const result = await Resume.findByIdAndUpdate(listResume[i], {
                                $set: {
                                    allowSearch: true
                                }
                            }, {
                                session,
                                new: true
                            })
                            if (!result) {
                                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
                            }
                            if (result.status !== "active") {
                                throw new BadRequestError(`Resume '${result.title}' cần được kích hoạt.`);
                            }
                        }
                    }
                } else {
                    await Resume.updateMany({ candidateId: userId }, {
                        $set: {
                            allowSearch: false
                        }
                    }, {
                        session
                    })
                    listResume = [];
                }
            }
            result.role = result.loginId?.role;
            delete result.loginId;
            result.avatar = result.avatar ?? null;
            result.phone = result.phone ?? null;
            result.gender = result.gender ?? null;
            result.homeTown = result.homeTown ?? null;
            result.workStatus = result.workStatus ?? null;
            result.dateOfBirth = result.dateOfBirth ?? null;
            result.listAllowSearchResume = listResume;
            await session.commitTransaction();
            session.endSession();
            return {
                message: "Cập nhật thông tin thành công",
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
            const candidate = await Candidate.findById(userId).select("-createdAt, -updatedAt, -__v");
            const oldAvatar = candidate.avatar;
            if (oldAvatar) {
                const splitArr = oldAvatar.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            candidate.avatar = avatar;
            await candidate.save();
            const result = await Candidate.findById(userId).populate('loginId').select("-createdAt, -updatedAt, -__v").lean();
            result.role = result.loginId?.role;
            delete result.loginId;
            result.phone = result.phone ?? null;
            result.gender = result.gender ?? null;
            result.homeTown = result.homeTown ?? null;
            result.workStatus = result.workStatus ?? null;
            result.dateOfBirth = result.dateOfBirth ?? null;
            return {
                message: "Cập nhật ảnh đại diện thành công",
                metadata: { ...result }
            }
        } catch (error) {
            throw error;
        }
    }

    static changePassword = async ({ userId, currentPassword, newPassword }) => {
        try {
            const email = (await Candidate.findById(userId).lean()).email;

            const { message } = await Login.changePassword({ email, currentPassword, newPassword });
            return {
                message: message
            }
        } catch (error) {
            throw error;
        }
    }

    static getListFavoriteJob = async ({ userId, page, limit, name }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { length, listFavoriteJob } = await FavoriteJobService.getListFavoriteJob({ userId, page, limit, name });
            return {
                message: "Lấy danh sách công việc yêu thích thành công.",
                metadata: { listFavoriteJob, totalElement: length },
                options: { page, limit }
            }
        } catch (error) {
            throw error;
        }
    }

    static getListFavoriteRecruiter = async ({ userId, page, limit, searchText }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { length, listFavoriteRecruiter } = await FavoriteRecruiterService.getListFavoriteRecruiter({ userId, page, limit, searchText });
            return {
                message: "Lấy danh sách nhà tuyển dụng yêu thích thành công.",
                metadata: { listFavoriteRecruiter, totalElement: length },
                options: { page, limit }
            }
        } catch (error) {
            throw error;
        }
    }

    static checkFavoriteJob = async ({ userId, jobId }) => {
        try {
            const { message, exist } = await FavoriteJobService.checkFavoriteJob({ userId, jobId });
            return {
                message,
                metadata: { exist }
            }
        } catch (error) {
            throw error;
        }
    }

    static checkFavoriteRecruiter = async ({ userId, slug }) => {
        try {
            const { message, exist } = await FavoriteRecruiterService.checkFavoriteRecruiter({ userId, slug });
            return {
                message,
                metadata: { exist }
            }
        } catch (error) {
            throw error;
        }
    }

    static addFavoriteJob = async ({ userId, jobId }) => {
        try {
            await FavoriteJobService.addFavoriteJob({ userId, jobId });
            return {
                message: "Thêm công việc yêu thích thành công.",
                metadata: {}
            }
        } catch (error) {
            throw error;
        }
    }

    static addFavoriteRecruiter = async ({ userId, recruiterId }) => {
        try {
            await FavoriteRecruiterService.addFavoriteRecruiter({ userId, recruiterId });
            _io.emit(`favorite_recruiter`, "reload");
            return {
                message: "Thêm nhà tuyển dụng yêu thích thành công.",
                metadata: {}
            }
        } catch (error) {
            throw error;
        }
    }

    static removeFavoriteJob = async ({ userId, jobId, page, limit, name }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { length, listFavoriteJob } = await FavoriteJobService.removeFavoriteJob({ userId, jobId, page, limit, name });
            return {
                message: "Xóa công việc yêu thích thành công.",
                metadata: { listFavoriteJob, totalElement: length },
                options: { page, limit }
            }
        } catch (error) {
            throw error;
        }
    }

    static removeFavoriteRecruiter = async ({ userId, recruiterId, page, limit, searchText }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { length, listFavoriteRecruiter } = await FavoriteRecruiterService.removeFavoriteRecruiter({ userId, recruiterId, page, limit, searchText });
            return {
                message: "Xóa nhà tuyển dụng yêu thích thành công.",
                metadata: { listFavoriteRecruiter, totalElement: length },
                options: { page, limit }
            }
        } catch (error) {
            throw error;
        }
    }

    static removeAllFavoriteJob = async ({ userId }) => {
        try {
            const { length, listFavoriteJob } = await FavoriteJobService.removeAllFavoriteJob({ userId });
            return {
                message: "Xóa toàn bộ công việc yêu thích thành công.",
                metadata: { listFavoriteJob, totalElement: length },
            }
        } catch (error) {
            throw error;
        }
    }

    static removeAllFavoriteRecruiter = async ({ userId }) => {
        try {
            const { length, listFavoriteRecruiter } = await FavoriteRecruiterService.removeAllFavoriteRecruiter({ userId });
            return {
                message: "Xóa toàn bộ nhà tuyển dụng yêu thích thành công.",
                metadata: { listFavoriteRecruiter, totalElement: length },
            }
        } catch (error) {
            throw error;
        }
    }



    static checkApplyJob = async ({ userId, jobId }) => {
        try {
            //check job
            const job = await Job.findById(jobId).lean();
            if (!job) {
                throw new BadRequestError("Không tìm thấy công việc.");
            }
            const application = await Application.findOne({ candidateId: userId, jobId: jobId }).lean();
            if (application) {
                return {
                    message: "Bạn đã ứng tuyển vào công việc này rồi.",
                    metadata: { apply: true }
                }
            }
            return {
                message: "Bạn chưa ứng tuyển vào công việc này.",
                metadata: { apply: false }
            }
        } catch (error) {
            throw error;
        }
    }

    static applyJob = async ({ userId, jobId, resumeId }) => {
        try {
            // check job
            const job = await Job.findById(jobId).lean();
            if (!job) {
                throw new BadRequestError("Không tìm thấy công việc.");
            }
            if (job.status !== "active" || job.acceptanceStatus !== "accept" || new Date(job.deadline) < Date.now()) {
                throw new BadRequestError("Có lỗi xảy ra vui lòng thử lại.");
            }
            // check resume
            const resume = await Resume.findOne({ _id: resumeId, candidateId: userId }).lean();
            if (!resume || resume.candidateId.toString() !== userId) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            if (resume.status === "inactive") {
                throw new BadRequestError("Vui lòng kích hoạt resume để ứng tuyển.");
            }
            // check apply
            const application = await Application.findOne({ candidateId: userId, jobId: jobId }).lean();
            if (application?.status) {
                if (application.status !== "Đã nộp") {
                    throw new BadRequestError("Đơn ứng tuyển đã được xử lý rồi.");
                }
            }
            // apply
            const result = await Application.findOneAndUpdate({ candidateId: userId, jobId: jobId }, {
                $set: {
                    resumeId: resumeId
                }
            }, {
                new: true,
                upsert: true
            })
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            return {
                message: "Ứng tuyển thành công."
            }
        } catch (error) {
            throw error;
        }
    }

    static cancelApplication = async ({ userId, jobId }) => {
        try {
            // check đơn ứng tuyển
            const application = await Application.findOne({ jobId: jobId, candidateId: userId });
            if (!application) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            if (application.status !== "Đã nộp") {
                throw new BadRequestError("Đơn ứng tuyển của bạn đã được xử lý, không thể hủy.")
            }
            const result = await Application.findOneAndDelete({ jobId: jobId, candidateId: userId });
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            return {
                message: "Hủy ứng tuyển thành công.",
            }
        } catch (error) {
            throw error;
        }
    }

    static getListApplication = async ({ userId, name, page, limit, status }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const pipeline = [
                {
                    $lookup: {
                        from: "jobs",
                        localField: "jobId",
                        foreignField: "_id",
                        as: "jobs"
                    }
                },
                {
                    $unwind: "$jobs"
                },
                {
                    $lookup: {
                        from: "recruiters",
                        localField: "jobs.recruiterId",
                        foreignField: "_id",
                        as: "recruiter"
                    }
                },
                {
                    $unwind: "$recruiter"
                },
                {
                    $match: {
                        "candidateId": new ObjectId(userId)
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "jobId": 1,
                        "jobs.name": 1,
                        "jobs.levelRequirement": 1,
                        "jobs.field": 1,
                        "recruiter.companyName": 1,
                        "jobs.deadline": 1,
                        "updatedAt": 1,
                        "status": 1,
                        "reasonDecline": 1
                    }
                }
            ]
            if (name) {
                pipeline.push({ $match: { "jobs.name": new RegExp(name, "i") } });
            }
            if (status) {
                pipeline.push({ $match: { "status": status } });
            }
            const totalDocument = await Application.aggregate([...pipeline, { $count: "totalDocuments" }]);
            const totalElement = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
            let listApplication = await Application.aggregate(
                [...pipeline, {
                    $sort: { updatedAt: -1 }
                }, {
                    $skip: (page - 1) * limit
                }, {
                    $limit: limit
                }]
            )
            listApplication = listApplication.map((item, index) => {
                item.name = item.jobs.name;
                item.levelRequirement = item.jobs.levelRequirement;
                item.field = item.jobs.field;
                item.deadline = formatInTimeZone(item.jobs.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
                item.updatedAt = formatInTimeZone(item.updatedAt, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
                item.companyName = item.recruiter.companyName;
                item.reasonDecline = item.reasonDecline ?? null;
                delete item.jobs;
                delete item.recruiter;
                return {
                    STT: index + 1,
                    ...item
                }
            })
            return {
                message: "Lấy danh sách công việc ứng tuyển thành công.",
                metadata: { listApplication, totalElement },
                options: { page, limit }
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

}

module.exports = CandidateService;