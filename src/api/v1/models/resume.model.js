const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;
const { v2: cloudinary } = require('cloudinary');

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

resumeSchema.statics.getListResume = async function ({ userId, page, limit }) {
    try {
        const length = await this.find({ candidateId: userId }).lean().countDocuments();
        const listResume = await this.find({ candidateId: userId }).lean().select("-__v")
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

module.exports = {
    Resume: model('Resume', resumeSchema)
};