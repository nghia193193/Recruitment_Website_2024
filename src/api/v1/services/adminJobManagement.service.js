const { InternalServerError, NotFoundRequestError } = require('../core/error.response');
const { Job } = require('../models/job.model');
const { Notification } = require('../models/notification.model');
const { Recruiter } = require('../models/recruiter.model');
const { FavoriteRecruiter } = require('../models/favoriteRecruiter.model');
const { mapRolePermission } = require('../utils');
const { default: mongoose } = require('mongoose');
const EmailService = require('./email.service');
const socketService = require('./socket.service');
const { Report } = require('../models/report.model');
const { formatInTimeZone } = require('date-fns-tz');


class AdminJobManagementService {
    // Tạo công việc
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

    // Xem chi tiết công việc
    static getJobDetail = async function ({ jobId }) {
        try {
            let job = await Job.findOne({ _id: jobId }).lean()
                .select("-__v -recruiterId")
            if (!job) {
                throw new NotFoundRequestError("Không tìm thấy công việc");
            }
            job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            return {
                message: "Lấy thông tin công việc thành công",
                metadata: { ...job }
            }
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật công việc
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

    // Cấm công việc
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
            const reporters = await Report.find({ jobId }).lean();
            if (reporters.length !== 0) {
                for (let i = 0; i < reporters.length; i++) {
                    await EmailService.sendThanksMailToReporter({toEmail: reporters[i].email, name: reporters[i].name, jobName: result.name});
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static getListReportedJob = async ({ companyName, name, field, levelRequirement, page, limit }) => {
        try {
            page = page ? page : 1;
            limit = limit ? limit : 5;
            const match = {
                status: "active",
                isBan: false,
                deadline: { $gte: new Date() }
            };
            if (name) {
                match["$text"] = { $search: name };
            }
            const query = {};
            if (companyName) {
                query["recruiters.companyName"] = new RegExp(companyName, "i");
            }
            if (field) {
                query["field"] = field;
            }
            if (levelRequirement) {
                query["levelRequirement"] = levelRequirement;
            }

            const commonPipeline = [
                {
                    $lookup: {
                        from: 'reports',
                        let: { jobId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$jobId', '$$jobId']
                                    }
                                }
                            },
                            { $count: 'reportNumber' }
                        ],
                        as: 'reportDetails'
                    }
                },
                {
                    $addFields: {
                        reportNumber: { $ifNull: [{ $arrayElemAt: ['$reportDetails.reportNumber', 0] }, 0] }
                    }
                },
                {
                    $match: {
                        reportNumber: { $gt: 0 }
                    }
                },
                {
                    $lookup: {
                        from: "recruiters",
                        localField: "recruiterId",
                        foreignField: "_id",
                        as: "recruiters"
                    }
                },
                {
                    $match: query
                },
                {
                    $project: {
                        "_id": 1,
                        "name": 1,
                        "type": 1,
                        "salary": 1,
                        "province": 1,
                        "levelRequirement": 1,
                        "field": 1,
                        "deadline": 1,
                        "recruiters.companyName": 1,
                        "recruiters.slug": 1,
                        "recruiters.employeeNumber": 1,
                        "recruiters.companyLogo": 1,
                        "reportNumber": 1,
                        "updatedAt": 1,
                    }
                }
            ];

            const totalDocumentPipeline = [
                { $match: match },
                ...commonPipeline,
                { $count: "totalDocuments" }
            ];
            const resultPipeline = [
                { $match: match },
                ...commonPipeline,
                {
                    $sort: {
                        "reportNumber": -1,
                        "updatedAt": -1
                    }
                },
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: limit
                }
            ];

            const totalDocument = await Job.aggregate(totalDocumentPipeline);
            const length = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
            let result = await Job.aggregate(resultPipeline);
            result = result.map(job => {
                job.companySlug = job.recruiters[0].slug ?? null;
                job.companyName = job.recruiters[0].companyName ?? null;
                job.companyLogo = job.recruiters[0].companyLogo ?? null;
                job.employeeNumber = job.recruiters[0].employeeNumber;
                job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
                delete job.recruiters;
                return { ...job };
            })
            return {
                message: "Lấy danh sách công việc thành công",
                metadata: { listJob: result, totalElement: length },
                options: {
                    page: page,
                    limit: limit
                }
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminJobManagementService;