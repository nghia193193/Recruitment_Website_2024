const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;
const { formatInTimeZone } = require('date-fns-tz');
const { NotFoundRequestError, InternalServerError, BadRequestError } = require('../core/error.response');
const { acceptanceStatus } = require('../utils');
const { Recruiter } = require('./recruiter.model');

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
    approvalDate: Date
}, {
    timestamps: true
})

jobSchema.statics.changeJobStatus = async function ({ userId, jobId, status }) {
    try {
        const job = await this.findOneAndUpdate({ _id: jobId, recruiterId: userId }, {
            $set: {
                status: status
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
        return job;
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.updateJob = async function ({ userId, jobId, name, location, province, type, levelRequirement,
    experience, salary, field, description, requirement, benefit, quantity, deadline, gender }) {
    try {
        const job = await this.findOneAndUpdate({ _id: jobId, recruiterId: userId }, {
            $set: {
                name, location, province, type, levelRequirement, experience, salary,
                field, description, requirement, benefit, quantity, deadline, gender, acceptanceStatus: "waiting"
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
        return job;
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.getListWaitingJobByRecruiterId = async function ({ userId, name, field, levelRequirement, status, page, limit }) {
    try {
        const query = {
            recruiterId: userId,
            acceptanceStatus: "waiting"
        }
        if (name) {
            query["name"] = new RegExp(name, "i");
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
        result = result.map(item => {
            return {
                ...item,
                applicationNumber: 0
            }
        })
        return {
            length, result
        }
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.getListAcceptedJobByRecruiterId = async function ({ userId, name, field, levelRequirement, status, page, limit }) {
    try {
        const query = {
            recruiterId: userId,
            acceptanceStatus: "accept"
        }
        if (name) {
            query["name"] = new RegExp(name, "i");
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
        result = result.map(item => {
            return {
                ...item,
                applicationNumber: 0
            }
        })
        return {
            length, result
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
            query["name"] = new RegExp(name, "i");
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
        result = result.map(item => {
            return {
                ...item,
                applicationNumber: 0
            }
        })
        return {
            length, result
        }
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.getListJobAdmin = async function ({ companyName, name, field, levelRequirement, acceptanceStatus, page, limit }) {
    try {
        const pipeline = [
            {
                $lookup: {
                    from: "recruiters",
                    localField: "recruiterId",
                    foreignField: "_id",
                    as: "recruiters"
                }
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
                    "acceptanceStatus": 1,
                    "recruiters.companyName": 1,
                    "recruiters.slug": 1,
                    "recruiters.employeeNumber": 1,
                    "recruiters.companyLogo": 1,
                }
            }
        ]
        if (companyName) {
            pipeline.push({
                $match: {
                    "recruiters.companyName": new RegExp(companyName, "i")
                }
            });
        }
        if (name) {
            pipeline.push({
                $match: {
                    "name": new RegExp(name, "i")
                }
            });
        }
        if (field) {
            pipeline.push({
                $match: {
                    "field": field
                }
            });
        }
        if (levelRequirement) {
            pipeline.push({
                $match: {
                    "levelRequirement": levelRequirement
                }
            });
        }
        if (acceptanceStatus) {
            pipeline.push({
                $match: {
                    "acceptanceStatus": acceptanceStatus
                }
            });
        }
        const totalDocument = await this.aggregate([...pipeline, { $count: "totalDocuments" }]);
        const length = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
        let result = await this.aggregate(
            [...pipeline, {
                $sort: {
                    "updatedAt": -1
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            }]
        );
        result = result.map(job => {
            job.companySlug = job.recruiters[0].slug ?? null;
            job.companyName = job.recruiters[0].companyName ?? null;
            job.companyLogo = job.recruiters[0].companyLogo?.url ?? null;
            job.employeeNumber = job.recruiters[0].employeeNumber;
            job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
            delete job.recruiters;
            return { ...job };
        })
        return {
            length, result
        }
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.getListJob = async function ({ name, province, type, levelRequirement, experience, field,
    genderRequirement, page, limit }) {
    try {
        const query = {
            status: "active",
            acceptanceStatus: "accept"
        };
        if (name) {
            query["name"] = new RegExp(name, "i");
        }
        if (province) {
            query["province"] = province;
        }
        if (type) {
            query["type"] = type;
        }
        if (experience) {
            query["experience"] = experience;
        }
        if (field) {
            query["field"] = field;
        }
        if (levelRequirement) {
            query["levelRequirement"] = levelRequirement;
        }
        if (genderRequirement) {
            query["genderRequirement"] = genderRequirement;
        }
        const length = await this.find(query).lean().countDocuments();
        let result = await this.find(query).lean().populate("recruiterId")
            .select("name field type levelRequirement salary province approvalDate deadline recruiterId createdAt updatedAt")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ updatedAt: -1 })
        result = result.map(job => {
            job.companyName = job.recruiterId.companyName ?? null;
            job.companyLogo = job.recruiterId.companyLogo?.url ?? null;
            job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.approvalDate = job.approvalDate ? formatInTimeZone(job.approvalDate, "Asia/Ho_Chi_Minh", "dd/MM/yyyy") : null;
            job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
            delete job.recruiterId;
            return { ...job };
        })
        return {
            length, result
        }
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.getListJobOfRecruiter = async function ({ slug, name, province, type, levelRequirement, experience, field,
    genderRequirement, page, limit }) {
    try {
        const pipeline = [
            {
                $lookup: {
                    from: "recruiters",
                    localField: "recruiterId",
                    foreignField: "_id",
                    as: "recruiters"
                }
            },
            {
                $match: {
                    "recruiters.slug": slug,
                    "status": "active",
                    "acceptanceStatus": "accept",
                }
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
                    "acceptanceStatus": 1,
                    "approvalDate": 1,
                    "recruiters.companyName": 1,
                    "recruiters.slug": 1,
                    "recruiters.employeeNumber": 1,
                    "recruiters.companyLogo": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            }
        ]
        if (name) {
            pipeline.push({
                $match: {
                    "name": new RegExp(name, "i")
                }
            });
        }
        if (province) {
            pipeline.push({
                $match: {
                    "province": province
                }
            });
        }
        if (type) {
            pipeline.push({
                $match: {
                    "type": type
                }
            });
        }
        if (experience) {
            pipeline.push({
                $match: {
                    "experience": experience
                }
            });
        }
        if (field) {
            pipeline.push({
                $match: {
                    "field": field
                }
            });
        }
        if (levelRequirement) {
            pipeline.push({
                $match: {
                    "levelRequirement": levelRequirement
                }
            });
        }
        if (genderRequirement) {
            pipeline.push({
                $match: {
                    "genderRequirement": genderRequirement
                }
            });
        }
        const totalDocument = await this.aggregate([...pipeline, { $count: "totalDocuments" }]);
        const length = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
        let result = await this.aggregate(
            [...pipeline, {
                $sort: {
                    "updatedAt": -1
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            }]
        );
        result = result.map(job => {
            job.companySlug = job.recruiters[0].slug ?? null;
            job.companyName = job.recruiters[0].companyName ?? null;
            job.companyLogo = job.recruiters[0].companyLogo?.url ?? null;
            job.employeeNumber = job.recruiters[0].employeeNumber;
            job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.approvalDate = job.approvalDate ? formatInTimeZone(job.approvalDate, "Asia/Ho_Chi_Minh", "dd/MM/yyyy") : null;
            job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
            delete job.recruiters;
            return { ...job };
        })
        return {
            length, result
        }
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.getJobDetail = async function ({ jobId }) {
    try {
        let job = await this.findById(jobId).lean().populate("recruiterId")
            .select("-__v ")
        if (!job) {
            throw new NotFoundRequestError("Không tìm thấy công việc");
        }
        job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
        job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        job.approvalDate = job.approvalDate ? formatInTimeZone(job.approvalDate, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX") : undefined;
        job.companyName = job.recruiterId.companyName ?? null;
        job.companySlug = job.recruiterId.slug ?? null;
        job.companyLogo = job.recruiterId.companyLogo?.url ?? null;
        job.employeeNumber = job.recruiterId.employeeNumber;
        job.companyAddress = job.recruiterId.companyAddress;
        delete job.recruiterId;
        return job;
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
        job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        return job;
    } catch (error) {
        throw error;
    }
}

jobSchema.statics.approveJob = async function ({ jobId, acceptanceStatus }) {
    try {
        const job = await this.findOneAndUpdate({ _id: jobId }, {
            $set: {
                acceptanceStatus: acceptanceStatus,
                approvalDate: formatInTimeZone(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
            }
        }, {
            new: true,
            select: { __v: 0 }
        }).lean().populate("recruiterId")
        if (!job) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
        }
        job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
        job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        job.approvalDate = formatInTimeZone(job.approvalDate, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        job.companyName = job.recruiterId.companyName ?? null;
        job.companyLogo = job.recruiterId.companyLogo?.url ?? null;
        job.employeeNumber = job.recruiterId.employeeNumber;
        job.companyAddress = job.recruiterId.companyAddress;
        delete job.recruiterId;
        return job;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Job: model('Job', jobSchema)
};