const { InternalServerError } = require('../core/error.response');
const { Job } = require('../models/job.model');
const { Notification } = require('../models/notification.model');
const { Recruiter } = require('../models/recruiter.model');
const { FavoriteRecruiter } = require('../models/favoriteRecruiter.model');
const { mapRolePermission } = require('../utils');
const { default: mongoose } = require('mongoose');
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
                requirement, benefit, quantity, deadline, gender, recruiterId, status: "active"
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
        field, description, requirement, benefit, quantity, deadline, gender }) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            let result = await Job.findByIdAndUpdate(jobId, {
                $set: {
                    name, location, province, type, levelRequirement, experience, salary, field, description,
                    requirement, benefit, quantity, deadline, gender
                }
            }, {
                session,
                new: true,
                select: { __v: 0, recruiterId: 0 }
            }).lean()
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

    static banJob = async ({ jobId, isBan, bannedReason }) => {
        try {
            let result;
            if (isBan) {
                result = await Job.findByIdAndUpdate(jobId, {
                    $set: {
                        isBan, bannedReason, bannedAt: new Date()
                    }
                }, {
                    new: true,
                    select: { __v: 0, recruiterId: 0 }
                }).lean()
            } else {
                result = await Job.findByIdAndUpdate(jobId, {
                    $set: {
                        isBan, bannedReason: null, bannedAt: null
                    }
                }, {
                    new: true,
                    select: { __v: 0, recruiterId: 0 }
                }).lean()
            }
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại.');
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminJobManagementService;