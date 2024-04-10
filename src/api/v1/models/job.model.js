const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const jobSchema = new Schema({
    name: { //tên
        type: String,
        trim: true,
        reuired: true
    },
    location: { // địa điểm
        type: String,
        trim: true,
        reuired: true
    },
    type: { // loại: part_time || full_time || remote
        type: String,
        trim: true,
        reuired: true
    },
    levelRequirement: { // thực tập sinh, nhân viên, trưởng phòng
        type: String,
        trim: true,
        reuired: true
    },
    experience: String, // kinh nghiệm: chưa có, dưới 1 năm, 1 năm, 2 năm, 3 , 4 ,5 , trên 5
    salary: String, // range
    field: String, // lĩnh vực
    description: { // mô tả
        type: String,
        trim: true,
        reuired: true
    },
    requirement: String, // yêu cầu
    benefit: String, // lợi ích
    quantity: { // số lượng tuyển
        type: Number,
        reuired: true
    },
    deadline: { // hạn tuyển
        type: Date,
        reuired: true
    },
    recruiterId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Recruiter'
    },
    isActive: Boolean,
    isApproved: Boolean
},{
    timestamps: true
})

module.exports = {
    Job: model('Job', jobSchema)
};