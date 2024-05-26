const { formatInTimeZone } = require('date-fns-tz');
const mongoose = require('mongoose');
const { InternalServerError, BadRequestError } = require('../core/error.response');
const model = mongoose.model;
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const applicationSchema = new Schema({
    jobId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Job'
    },
    candidateId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Candidate'
    },
    resumeId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Resume'
    },
    status: {
        type: String,
        enum: ['Đã nộp', 'Đã nhận', 'Không nhận'],
        default: 'Đã nộp'
    },
    reasonDecline: String
}, {
    timestamps: true
})

applicationSchema.statics.getJobApplicationNumber = async function ({ jobId }) {
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
        const totalDocument = await this.aggregate([...pipeline, { $count: "totalDocuments" }]);
        const totalElement = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
        return totalElement;
    } catch (error) {
        throw error;
    }
}

applicationSchema.statics.getListJobApplicationExperience = async function ({ userId, jobId}) {
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
        let listExperience = await this.aggregate(pipeline);
        listExperience = listExperience.map(item => item.resume.experience);
        return listExperience;
    } catch (error) {
        throw error;
    }
}

applicationSchema.statics.getListJobApplication = async function ({ userId, jobId, candidateName, experience, status,
    major, goal, page, limit }) {
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
        const totalDocument = await this.aggregate([...pipeline, { $count: "totalDocuments" }]);
        const totalElement = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
        let listApplication = await this.aggregate(
            [...pipeline, {
                $sort: { updatedAt: 1 }
            }, {
                $skip: (page - 1) * limit
            }, {
                $limit: limit
            }]
        )
        listApplication = listApplication.map((item) => {
            item.resume.avatar = item.resume.avatar.url;
            item.resume.updatedAt = formatInTimeZone(item.resume.updatedAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
            return {
                _id: item._id,
                status: item.status,
                ...item.resume
            }
        })
        return { listApplication, totalElement };
    } catch (error) {
        throw error;
    }
}

applicationSchema.statics.getApplicationDetail = async function ({ userId, applicationId }) {
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
                    "job.recruiterId": new ObjectId(userId),
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
                    "jobId": 1
                }
            }
        ]
        const totalDocument = await this.aggregate([...pipeline, { $count: "totalDocuments" }]);
        const totalElement = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
        if (totalElement === 0) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
        }
        let listApplication = await this.aggregate(pipeline);
        let jobName = listApplication[0].job.name;
        let quantity = listApplication[0].job.quantity;
        let jobId = listApplication[0].jobId;
        let result = listApplication[0].resume;
        result._id = listApplication[0]._id;
        delete result.__v;
        delete result.candidateId;
        result.avatar = result.avatar.url;
        result.createdAt = formatInTimeZone(result.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
        result.updatedAt = formatInTimeZone(result.updatedAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
        return { result, jobId, jobName, quantity };
    } catch (error) {
        throw error;
    }
}

applicationSchema.statics.getJobAcceptedApplicationNumber = async function ({ jobId }) {
    try {
        const totalElement = await this.find({ jobId, status: "Đã nhận" }).lean().countDocuments();
        return totalElement;
    } catch (error) {
        throw error;
    }
}

applicationSchema.statics.approveApplication = async function ({ userId, applicationId, status, reasonDecline }) {
    try {
        // validate recruiter
        const { result, jobId, jobName, quantity } = await this.getApplicationDetail({ userId, applicationId });
        if (!result) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
        }
        // validate quantity
        let application;
        const acceptedNumber = await this.getJobAcceptedApplicationNumber({ jobId });
        if (status === "Đã nhận") {
            if (acceptedNumber >= quantity) {
                throw new BadRequestError("Đã đủ số lượng cần tuyển, không thể nhận thêm!");
            }
            application = await this.findOneAndUpdate({ _id: applicationId }, {
                $set: {
                    status, reasonDecline: null
                }
            }, {
                new: true
            }).lean()
        } else {
            application = await this.findOneAndUpdate({ _id: applicationId }, {
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
        return { candidateId: application.candidateId, jobName };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Application: model('Application', applicationSchema)
};