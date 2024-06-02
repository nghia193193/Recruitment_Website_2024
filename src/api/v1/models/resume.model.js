const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;
const { v2: cloudinary } = require('cloudinary');
const { InternalServerError } = require('../core/error.response');
const { formatInTimeZone } = require('date-fns-tz');

const resumeSchema = new Schema({
    candidateId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Candidate'
    },
    name: {
        type: String,
        reuired: true
    },
    title: { // tiêu đề
        type: String,
        trim: true,
        required: true
    },
    avatar: String,
    goal: { // mục tiêu nghề nghiệp
        type: String,
        required: true
    },
    phone: { // sđt
        type: String,
        required: true
    },
    educationLevel: { // trình độ học vấn
        type: String,
        required: true
    },
    homeTown: { // quê quán
        type: String,
        required: true
    },
    dateOfBirth: { // ngày sinh
        type: Date,
        required: true
    },
    english: { // trình độ ngoại ngữ
        type: String,
        required: true
    },
    jobType: {  // loại hình công việc
        type: String,
        required: true
    },
    experience: String, // kinh nghiệm làm việc
    GPA: {
        type: Number,
        required: true
    },
    activity: { // giải thưởng | hoạt động ,....
        type: String,
        required: true
    },
    email: String,
    major: String,
    certifications: {
        type: Array,
        default: []
    },
    educations: {
        type: Array,
        default: []
    },
    workHistories: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    allowSearch: {
        type: Schema.Types.Boolean,
        default: false
    }
}, {
    timestamps: true
})

resumeSchema.index({ title: 'text' }, { default_language: 'none' });

resumeSchema.statics.getListResume = async function ({ userId, page, limit, title, status }) {
    try {
        const query = {
            candidateId: userId
        }
        if (title) {
            query["$text"] = { $search: title }
        }
        if (status) {
            query["status"] = status;
        }
        const length = await this.find(query).lean().countDocuments();
        let listResume = await this.find(query).lean().select("title name educationLevel status email major jobType experience avatar updatedAt")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ updatedAt: -1 });
        listResume = listResume.map(resume => {
            resume.avatar = resume.avatar;
            resume.updatedAt = formatInTimeZone(resume.updatedAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
            return resume;
        })
        return { length, listResume };
    } catch (error) {
        throw error;
    }
}

resumeSchema.statics.getResumeDetail = async function ({ userId, resumeId }) {
    try {
        const resume = await this.findOne({ _id: resumeId, candidateId: userId }).lean().select("-__v");
        if (!resume) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
        }
        delete resume.candidateId;
        resume.avatar = resume.avatar;
        resume.createdAt = formatInTimeZone(resume.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
        resume.updatedAt = formatInTimeZone(resume.updatedAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
        return resume;
    } catch (error) {
        throw error;
    }
}

resumeSchema.statics.changeStatus = async function ({ userId, resumeId, status }) {
    try {
        const result = await this.findOneAndUpdate({ _id: resumeId, candidateId: userId }, {
            $set: {
                status
            }
        }, {
            new: true,
            select: { __v: 0, candidateId: 0 }
        }).lean();
        if (!result) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
        }
        return result;
    } catch (error) {
        throw error;
    }
}



module.exports = {
    Resume: model('Resume', resumeSchema)
};