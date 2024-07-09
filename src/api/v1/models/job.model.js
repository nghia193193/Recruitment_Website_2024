const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

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

module.exports = {
    Job: model('Job', jobSchema)
};