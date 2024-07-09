const { formatInTimeZone } = require("date-fns-tz");
const { Application } = require("../models/application.model");
const { Job } = require("../models/job.model");
const mongoose = require('mongoose');
const { InternalServerError, BadRequestError } = require("../core/error.response");
const ObjectId = mongoose.Types.ObjectId;


class ApplicationService {
    static getJobApplicationNumber = async function ({ jobId }) {
        try {
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
                        from: "resumes",
                        localField: "resumeId",
                        foreignField: "_id",
                        as: "resume"
                    }
                },
                {
                    $unwind: "$resume"
                },
                {
                    $match: {
                        "jobId": new ObjectId(jobId),
                        $or: [
                            { "resume.status": "active" },
                            { "status": { $in: ['Đã nhận', 'Không nhận'] } }
                        ]
                    }
                }
            ]
            const totalDocument = await Application.aggregate([...pipeline, { $count: "totalDocuments" }]);
            const totalElement = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
            return totalElement;
        } catch (error) {
            throw error;
        }
    }

    static getJobAcceptedApplicationNumber = async function ({ jobId }) {
        try {
            const totalElement = await Application.find({ jobId, status: "Đã nhận" }).lean().countDocuments();
            return totalElement;
        } catch (error) {
            throw error;
        }
    }

    static getListJobApplication = async function ({ userId, jobId, candidateName, experience, status,
        major, goal, page, limit }) {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const job = await Job.findById(jobId).lean();
            if (!job) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            const pipeline = [
                {
                    $lookup: {
                        from: "jobs",
                        localField: "jobId",
                        foreignField: "_id",
                        as: "job"
                    }
                },
                {
                    $unwind: "$job"
                },
                {
                    $lookup: {
                        from: "resumes",
                        localField: "resumeId",
                        foreignField: "_id",
                        as: "resume"
                    }
                },
                {
                    $unwind: "$resume"
                },
                {
                    $match: {
                        "jobId": new ObjectId(jobId),
                        "job.recruiterId": new ObjectId(userId),
                        $or: [
                            { "resume.status": "active" },
                            { "status": { $in: ['Đã nhận', 'Không nhận'] } }
                        ]
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "job.quantity": 1,
                        "resume.name": 1,
                        "resume.email": 1,
                        "resume.phone": 1,
                        "resume.educationLevel": 1,
                        "resume.experience": 1,
                        "resume.avatar": 1,
                        "resume.major": 1,
                        "resume.goal": 1,
                        "resume.updatedAt": 1,
                        "status": 1
                    }
                }
            ]
            if (candidateName) {
                pipeline.push({ $match: { "resume.name": new RegExp(candidateName, "i") } });
            }
            if (experience) {
                pipeline.push({ $match: { "resume.experience": new RegExp(experience, "i") } });
            }
            if (status) {
                pipeline.push({ $match: { "status": status } });
            }
            if (major) {
                pipeline.push({ $match: { "resume.major": new RegExp(major, "i") } });
            }
            if (goal) {
                pipeline.push({ $match: { "resume.goal": new RegExp(goal, "i") } });
            }
            const totalDocument = await Application.aggregate([...pipeline, { $count: "totalDocuments" }]);
            const totalElement = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
            let listApplication = await Application.aggregate(
                [...pipeline, {
                    $skip: (page - 1) * limit
                }, {
                    $limit: limit
                }]
            )
            listApplication = listApplication.map((item) => {
                item.resume.avatar = item.resume.avatar;
                item.resume.updatedAt = formatInTimeZone(item.resume.updatedAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
                return {
                    _id: item._id,
                    status: item.status,
                    ...item.resume
                }
            })
            const acceptedNumber = await this.getJobAcceptedApplicationNumber({ jobId });
            return {
                message: "Lấy danh sách ứng tuyển thành công",
                metadata: {
                    totalElement, listApplication, acceptedNumber,
                    name: job.name,
                    type: job.type,
                    quantity: job.quantity,
                    levelRequirement: job.levelRequirement
                },
                options: { page, limit }
            }
        } catch (error) {
            throw error;
        }
    }

    static getListJobApplicationExperience = async function ({ userId, jobId}) {
        try {
            const job = await Job.findById(jobId).lean();
            if (!job) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            const pipeline = [
                {
                    $lookup: {
                        from: "jobs",
                        localField: "jobId",
                        foreignField: "_id",
                        as: "job"
                    }
                },
                {
                    $unwind: "$job"
                },
                {
                    $lookup: {
                        from: "resumes",
                        localField: "resumeId",
                        foreignField: "_id",
                        as: "resume"
                    }
                },
                {
                    $unwind: "$resume"
                },
                {
                    $match: {
                        "jobId": new ObjectId(jobId),
                        "job.recruiterId": new ObjectId(userId),
                        $or: [
                            { "resume.status": "active" },
                            { "status": { $in: ['Đã nhận', 'Không nhận'] } }
                        ]
                    }
                },
                {
                    $project: {
                        "resume.experience": 1
                    }
                }
            ]
            let listExperience = await Application.aggregate(pipeline);
            listExperience = listExperience.map(item => item.resume.experience);
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

    static getApplicationDetail = async function ({ applicationId }) {
        try {
            const pipeline = [
                {
                    $lookup: {
                        from: "jobs",
                        localField: "jobId",
                        foreignField: "_id",
                        as: "job"
                    }
                },
                {
                    $unwind: "$job"
                },
                {
                    $lookup: {
                        from: "resumes",
                        localField: "resumeId",
                        foreignField: "_id",
                        as: "resume"
                    }
                },
                {
                    $unwind: "$resume"
                },
                {
                    $match: {
                        "_id": new ObjectId(applicationId),
                        $or: [
                            { "resume.status": "active" },
                            { "status": { $in: ['Đã nhận', 'Không nhận'] } }
                        ]
                    }
                },
                {
                    $project: {
                        "resume": 1,
                        "job.name": 1,
                        "job.quantity": 1,
                        "status": 1,
                        "reasonDecline": 1,
                        "jobId": 1
                    }
                }
            ]
            const totalDocument = await Application.aggregate([...pipeline, { $count: "totalDocuments" }]);
            const totalElement = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
            if (totalElement === 0) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            let listApplication = await Application.aggregate(pipeline);
            let jobName = listApplication[0].job.name;
            let quantity = listApplication[0].job.quantity;
            let jobId = listApplication[0].jobId;
            let result = listApplication[0].resume;
            result._id = listApplication[0]._id;
            delete result.__v;
            delete result.candidateId;
            result.status = listApplication[0].status;
            result.reasonDecline = listApplication[0].reasonDecline ?? null;
            result.avatar = result.avatar;
            result.createdAt = formatInTimeZone(result.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
            result.updatedAt = formatInTimeZone(result.updatedAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
            return { result, jobId, jobName, quantity };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ApplicationService;