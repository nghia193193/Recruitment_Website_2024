const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;
const { v2: cloudinary } = require('cloudinary');
const { InternalServerError } = require('../core/error.response');

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
    avatar: { // ảnh đại diện
        publicId: String,
        url: String
    },
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
    }
}, {
    timestamps: true
})

resumeSchema.statics.getListResume = async function ({ userId, page, limit, title }) {
    try {
        const query = {
            candidateId: userId
        }
        if (title) {
            query["title"] = new RegExp(title, "i");
        }
        const length = await this.find(query).lean().countDocuments();
        const listResume = await this.find(query).lean().select("-__v")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ updatedAt: -1 });
        return { length, listResume };
    } catch (error) {
        throw error;
    }
}

resumeSchema.statics.addResume = async function ({ userId, name, title, avatar, goal, phone, educationLevel, homeTown,
    dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories }) {
    try {
        let ava;
        //upload avatar
        if (avatar?.tempFilePath) {
            const resultAvatar = await cloudinary.uploader.upload(avatar.tempFilePath);
            if (!resultAvatar) {
                throw InternalServerError("Upload ảnh đại diện thất bại");
            };
            const avatarPublicId = resultAvatar.public_id;
            const avatarUrl = cloudinary.url(avatarPublicId);
            ava = {
                publicId: avatarPublicId,
                url: avatarUrl
            }
        } else {
            ava = {
                url: avatar
            }
        }
        const newResume = await this.create({
            candidateId: userId, name, title, avatar: ava, goal, phone, educationLevel, homeTown,
            dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories
        });
        return newResume.toObject();
    } catch (error) {
        throw error;
    }
}

resumeSchema.statics.updateResume = async function ({ userId, resumeId, name, title, avatar, goal, phone, educationLevel, homeTown,
    dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories }) {
    try {
        // check resume
        const resume = await this.findById(resumeId);
        if (!resume) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
        }
        if (resume.candidateId.toString() !== userId) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
        }
        //upload avatar
        let ava;
        if (avatar) {
            if (avatar.tempFilePath) {
                const resultAvatar = await cloudinary.uploader.upload(avatar.tempFilePath);
                if (!resultAvatar) {
                    throw InternalServerError("Upload ảnh đại diện thất bại");
                };
                const avatarPublicId = resultAvatar.public_id;
                const avatarUrl = cloudinary.url(avatarPublicId);
                ava = {
                    publicId: avatarPublicId,
                    url: avatarUrl
                }
                //check oldAvatar
                const oldAvatar = resume.avatar?.publicId;
                if (oldAvatar) {
                    await cloudinary.uploader.destroy(oldAvatar);
                };
            } else {
                const oldAvatar = resume.avatar;
                if (oldAvatar.url === avatar) {
                    ava = oldAvatar
                } else {
                    ava = {
                        url: avatar
                    }
                }
            }
        }
        const result = await this.findOneAndUpdate({ _id: resumeId }, {
            $set: {
                name, title, avatar: ava, goal, phone, educationLevel, homeTown,
                dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories
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