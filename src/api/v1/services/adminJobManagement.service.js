const { InternalServerError } = require('../core/error.response');
const { Job } = require('../models/job.model');
const { Notification } = require('../models/notification.model');
const { Recruiter } = require('../models/recruiter.model');
const { FavoriteRecruiter } = require('../models/favoriteRecruiter.model');
const { mapRolePermission } = require('../utils');
const { default: mongoose } = require('mongoose');
const { formatInTimeZone } = require('date-fns-tz');
const { Socket } = require('socket.io');
const socketService = require('./socket.service');


class AdminJobManagementService {
    static createJob = async ({ recruiterId, name, location, province, type, levelRequirement, experience, salary,
        field, description, requirement, benefit, quantity, deadline, gender }) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const recruiter = await Recruiter.findById(recruiterId).lean();
            if (!recruiter) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại.');
            }
            const result = await Job.create([{
                name, location, province, type, levelRequirement, experience, salary, field, description,
                requirement, benefit, quantity, deadline, gender, recruiterId, acceptanceStatus: "accept",
                status: "active", approvalDate: new Date()
            }], { session })
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại.');
            }
            // thông báo tới ứng viên yêu thích nhà tuyển dụng
            const userSockets = socketService.getUserSockets();
            const listCandidate = await FavoriteRecruiter.find({ favoriteRecruiters: recruiterId.toString() }).lean();
            if (listCandidate.length !== 0) {
                for (let i = 0; i < listCandidate.length; i++) {
                    const notificationCandidate = await Notification.create([{
                        senderId: recruiterId,
                        receiverId: listCandidate[i].candidateId,
                        senderCode: mapRolePermission["RECRUITER"],
                        link: `${process.env.FE_URL}/jobs/${result[0]._id.toString()}`,
                        title: "Nhà tuyển dụng đã đăng việc làm mới.",
                        content: `${recruiter.companyName} vừa đăng tải tin tuyển dụng mới. Vào xem ngay!`
                    }], { session })
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
            await session.commitTransaction();
            session.endSession();
            return {
                message: "Tạo công việc thành công"
            }
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    static updateJob = async ({ jobId, name, location, province, type, levelRequirement, experience, salary,
        field, description, requirement, benefit, quantity, deadline, gender, acceptanceStatus, reasonDecline }) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            let result;
            if (acceptanceStatus === "accept") {
                result = await Job.findByIdAndUpdate(jobId, {
                    $set: {
                        name, location, province, type, levelRequirement, experience, salary, field, description,
                        requirement, benefit, quantity, deadline, gender, acceptanceStatus, reasonDecline: null,
                        approvalDate: new Date()
                    }
                }, {
                    session,
                    new: true,
                    select: { __v: 0, recruiterId: 0 }
                }).lean()
            } else {
                result = await Job.findByIdAndUpdate(jobId, {
                    $set: {
                        name, location, province, type, levelRequirement, experience, salary, field, description,
                        requirement, benefit, quantity, deadline, gender, acceptanceStatus, reasonDecline,
                        approvalDate: new Date()
                    }
                }, {
                    session,
                    new: true,
                    select: { __v: 0, recruiterId: 0 }
                }).lean()
            }
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại.');
            }
            await session.commitTransaction();
            session.endSession();
            return {
                message: "Cập nhật công việc thành công",
                metadata: {
                    ...result
                }
            }
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    static approveJob = async ({ userId, jobId, acceptanceStatus, reasonDecline }) => {
        try {
            let job;
            if (acceptanceStatus === "accept") {
                job = await Job.findOneAndUpdate({ _id: jobId }, {
                    $set: {
                        acceptanceStatus: acceptanceStatus,
                        approvalDate: formatInTimeZone(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
                        reasonDecline: null
                    }
                }, {
                    new: true,
                    select: { __v: 0 }
                }).lean().populate("recruiterId")
            } else {
                job = await Job.findOneAndUpdate({ _id: jobId }, {
                    $set: {
                        acceptanceStatus: acceptanceStatus,
                        approvalDate: formatInTimeZone(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
                        reasonDecline
                    }
                }, {
                    new: true,
                    select: { __v: 0 }
                }).lean().populate("recruiterId")
            }
            if (!job) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            const recruiterId = job.recruiterId._id;
            job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
            job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.approvalDate = formatInTimeZone(job.approvalDate, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.companyName = job.recruiterId.companyName ?? null;
            const companyName = job.companyName;
            job.companyLogo = job.recruiterId.companyLogo ?? null;
            job.employeeNumber = job.recruiterId.employeeNumber;
            job.companyAddress = job.recruiterId.companyAddress;
            job.reasonDecline = job.reasonDecline ?? null;
            delete job.recruiterId;
            // thông báo tới nhà tuyển dụng
            const notification = await Notification.create({
                senderId: userId,
                receiverId: recruiterId,
                senderCode: mapRolePermission["ADMIN"],
                link: `${process.env.FE_URL}/recruiter/profile/jobsPosted`,
                title: "Quản trị viên đã duyệt công việc do bạn tạo.",
                content: `Công việc '${job.name}' ${acceptanceStatus === "accept" ? "đã được chấp thuận" : "đã bị từ chối"}`
            })
            if (!notification) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            // thông báo tới ứng viên yêu thích nhà tuyển dụng
            const userSockets = socketService.getUserSockets();
            if (acceptanceStatus === "accept") {
                const listCandidate = await FavoriteRecruiter.find({ favoriteRecruiters: recruiterId.toString() }).lean();
                if (listCandidate.length !== 0) {
                    for (let i = 0; i < listCandidate.length; i++) {
                        const notificationCandidate = await Notification.create({
                            senderId: recruiterId,
                            receiverId: listCandidate[i].candidateId,
                            senderCode: mapRolePermission["RECRUITER"],
                            link: `${process.env.FE_URL}/jobs/${jobId}`,
                            title: "Nhà tuyển dụng đã đăng việc làm mới.",
                            content: `${companyName} vừa đăng tải tin tuyển dụng mới. Vào xem ngay!`
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
            }
            const socketId = userSockets.get(recruiterId.toString());
            if (socketId) {
                _io.to(socketId).emit('user_notification', notification);
                console.log(`Notification sent to user ${recruiterId}: ${notification}`);
            }
            return {
                message: "Duyệt công việc thành công",
                metadata: { ...job },
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminJobManagementService;