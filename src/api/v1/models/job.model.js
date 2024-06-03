const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;
const { formatInTimeZone } = require('date-fns-tz');
const { NotFoundRequestError, InternalServerError } = require('../core/error.response');
const { Application } = require('./application.model');

const jobSchema = new Schema({
    name: { //tên
        type: String,
        reuired: true
    },
    location: { // địa điểm công việc
        type: String,
        reuired: true
    },
    province: {
        type: String,
        required: true
    },
    type: { // loại hình cv: part_time || full_time || remote
        type: String,
        enum: ["Toàn thời gian", "Bán thời gian", "Remote"],
        reuired: true
    },
    levelRequirement: { // vị trí: thực tập sinh, nhân viên, trưởng phòng
        type: String,
        enum: ["Thực tập sinh", "Nhân viên", "Trưởng phòng"],
        reuired: true
    },
    experience: {
        type: String,
        enum: ["Không yêu cầu kinh nghiệm", "Dưới 1 năm", "1 năm", "2 năm", "3 năm", "4 năm", "5 năm", "Trên 5 năm"],
        required: true
    }, // kinh nghiệm: chưa có, dưới 1 năm, 1 năm, 2 năm, 3 , 4 ,5 , trên 5
    salary: {
        type: String,
        required: true
    }, // range
    field: {
        type: String,
        required: true
    }, // lĩnh vực
    description: { // mô tả
        type: String,
        reuired: true
    },
    requirement: {
        type: String,
        required: true
    }, // yêu cầu
    benefit: {
        type: String,
        required: true
    }, // lợi ích
    quantity: { // số lượng tuyển
        type: Number,
        reuired: true
    },
    deadline: { // hạn tuyển
        type: Date,
        reuired: true
    },
    genderRequirement: {
        type: String,
        enum: ["Không yêu cầu", "Nam", "Nữ"],
        default: "Không yêu cầu"
    },
    recruiterId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Recruiter'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    acceptanceStatus: {
        type: String,
        enum: ["waiting", "accept", "decline"],
        default: "waiting"
    },
    approvalDate: Date,
    reasonDecline: String
}, {
    timestamps: true
})

jobSchema.index({ name: 'text' }, { default_language: 'none' });

jobSchema.statics.getListWaitingJobByRecruiterId = async function ({ userId, name, field, levelRequirement, status, page, limit }) {
    try {
        const query = {
            recruiterId: userId,
            acceptanceStatus: "waiting"
        }
        if (name) {
            query["$text"] = { $search: name };
        }
        if (field) {
            query["field"] = field;
        }
        if (levelRequirement) {
            query["levelRequirement"] = levelRequirement;
        }
        if (status) {
            query["status"] = status;
        }
        const length = await this.find(query).lean().countDocuments();
        let result = await this.find(query).lean()
            .select("name field type levelRequirement status deadline")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ updatedAt: -1 })
        let mappedList = await Promise.all(
            result.map(async (item) => {
                const applicationNumber = await Application.getJobApplicationNumber({ jobId: item._id });
                return {
                    ...item,
                    applicationNumber: applicationNumber
                }
            })
        )
        return {
            length, mappedList
        }
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.getListAcceptedJobByRecruiterId = async function ({ userId, name, field, levelRequirement, status, page, limit }) {
    try {
        const query = {
            recruiterId: userId,
            acceptanceStatus: "accept",
            deadline: { $gte: Date.now() }
        }
        if (name) {
            query["$text"] = { $search: name };
        }
        if (field) {
            query["field"] = field;
        }
        if (levelRequirement) {
            query["levelRequirement"] = levelRequirement;
        }
        if (status) {
            query["status"] = status;
        }
        const length = await this.find(query).lean().countDocuments();
        const result = await this.find(query).lean()
            .select("name field type levelRequirement status deadline")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ updatedAt: -1 })
        let mappedList = await Promise.all(
            result.map(async (item) => {
                const applicationNumber = await Application.getJobApplicationNumber({ jobId: item._id });
                return {
                    ...item,
                    applicationNumber: applicationNumber
                }
            })
        )
        return {
            length, mappedList
        }
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.getListDeclinedJobByRecruiterId = async function ({ userId, name, field, levelRequirement, status, page, limit }) {
    try {
        const query = {
            recruiterId: userId,
            acceptanceStatus: "decline"
        }
        if (name) {
            query["$text"] = { $search: name };
        }
        if (field) {
            query["field"] = field;
        }
        if (levelRequirement) {
            query["levelRequirement"] = levelRequirement;
        }
        if (status) {
            query["status"] = status;
        }
        const length = await this.find(query).lean().countDocuments();
        let result = await this.find(query).lean()
            .select("name field type levelRequirement status deadline")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ updatedAt: -1 })
        let mappedList = await Promise.all(
            result.map(async (item) => {
                const applicationNumber = await Application.getJobApplicationNumber({ jobId: item._id });
                return {
                    ...item,
                    applicationNumber: applicationNumber
                }
            })
        )
        return {
            length, mappedList
        }
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.getListNearingExpirationdJobByRecruiterId = async function ({ userId, name, field, levelRequirement, status, page, limit }) {
    try {
        const now = Date.now();
        const oneWeekFromNow = now + 7 * 24 * 60 * 60 * 1000;
        const query = {
            recruiterId: userId,
            deadline: { $gte: now, $lte: oneWeekFromNow }
        }
        if (name) {
            query["$text"] = { $search: name };
        }
        if (field) {
            query["field"] = field;
        }
        if (levelRequirement) {
            query["levelRequirement"] = levelRequirement;
        }
        if (status) {
            query["status"] = status;
        }
        const length = await this.find(query).lean().countDocuments();
        let result = await this.find(query).lean()
            .select("name field type levelRequirement status deadline")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ updatedAt: -1 })
        let mappedList = await Promise.all(
            result.map(async (item) => {
                const applicationNumber = await Application.getJobApplicationNumber({ jobId: item._id });
                return {
                    ...item,
                    applicationNumber: applicationNumber
                }
            })
        )
        return {
            length, mappedList
        }
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.getListExpiredJobByRecruiterId = async function ({ userId, name, field, levelRequirement, status, page, limit }) {
    try {
        const query = {
            recruiterId: userId,
            deadline: { $lt: Date.now() }
        }
        if (name) {
            query["$text"] = { $search: name };
        }
        if (field) {
            query["field"] = field;
        }
        if (levelRequirement) {
            query["levelRequirement"] = levelRequirement;
        }
        if (status) {
            query["status"] = status;
        }
        const length = await this.find(query).lean().countDocuments();
        let result = await this.find(query).lean()
            .select("name field type levelRequirement status deadline")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ updatedAt: -1 })
        let mappedList = await Promise.all(
            result.map(async (item) => {
                const applicationNumber = await Application.getJobApplicationNumber({ jobId: item._id });
                return {
                    ...item,
                    applicationNumber: applicationNumber
                }
            })
        )
        return {
            length, mappedList
        }
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.getJobDetailByRecruiter = async function ({ userId, jobId }) {
    try {
        let job = await this.findOne({ _id: jobId, recruiterId: userId }).lean()
            .select("-__v -recruiterId")
        if (!job) {
            throw new NotFoundRequestError("Không tìm thấy công việc");
        }
        job.reasonDecline = job.reasonDecline ?? null;
        job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        return job;
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.approveJob = async function ({ jobId, acceptanceStatus, reasonDecline }) {
    try {
        let job;
        if (acceptanceStatus === "accept") {
            job = await this.findOneAndUpdate({ _id: jobId }, {
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
            job = await this.findOneAndUpdate({ _id: jobId }, {
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
        return { job, recruiterId, companyName };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Job: model('Job', jobSchema)
};