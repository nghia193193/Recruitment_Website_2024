const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;
const { Job } = require('../models/job.model');
const { BadRequestError, InternalServerError } = require('../core/error.response');

const favoriteJobSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Candidate'
    },
    favoriteJobs: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
})

favoriteJobSchema.statics.getListFavoriteJob = async function ({ userId, page, limit }) {
    const candidate = await this.findOne({ candidateId: userId });
    if (!candidate) {
        return { length: 0, listFavoriteJob: [] };
    }
    let mappedFavoriteJobs = await Promise.all(
        candidate.favoriteJobs.map(async (jobId) => {
            const job = await Job.getJobDetail({ jobId });
            if (job.status === "active" && job.acceptanceStatus === "accept") {
                return job;
            }
        })
    )
    mappedFavoriteJobs = mappedFavoriteJobs.filter(job => {
        return job !== undefined;
    });
    const start = (page - 1) * limit;
    const end = start + limit;
    return { length: mappedFavoriteJobs.length, listFavoriteJob: mappedFavoriteJobs.slice(start, end) };
}

favoriteJobSchema.statics.addFavoriteJob = async function ({ userId, jobId }) {
    // check có job này không
    const job = await Job.findById(jobId).lean();
    if (!job) {
        throw new BadRequestError("Không tìm thấy công việc này, vui lòng thử lại");
    }
    if (job.status !== "active" || job.acceptanceStatus !== "accept") {
        throw new BadRequestError("Hiện tại không thể thêm công việc này");
    }
    // check đã có list chưa
    const listFavoriteJob = await this.findOne({ candidateId: userId });
    if (!listFavoriteJob) {
        return await this.create({ candidateId: userId, favoriteJobs: [jobId] });
    } 
    // check job đã có trong list chưa
    if (listFavoriteJob.favoriteJobs.includes(jobId)) {
        throw new BadRequestError("Bạn đã thêm công việc này vào công việc yêu thích rồi.");
    }
    listFavoriteJob.favoriteJobs.push(jobId);
    await listFavoriteJob.save();
}

favoriteJobSchema.statics.removeFavoriteJob = async function ({ userId, jobId, page, limit }) {
    // check đã có list chưa
    const listFavoriteJob = await this.findOne({ candidateId: userId });
    if (!listFavoriteJob) {
        throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
    }
    // check job đã có trong list chưa
    if (!listFavoriteJob.favoriteJobs.includes(jobId)) {
        throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
    }
    listFavoriteJob.favoriteJobs = listFavoriteJob.favoriteJobs.filter(job => job !== jobId);
    await listFavoriteJob.save();
    // trả về list đã xóa 
    const mappedFavoriteJobs = await Promise.all(
        listFavoriteJob.favoriteJobs.map(async (jobId) => {
            const job = await Job.getJobDetail({ jobId });
            if (job.status === "active" && job.acceptanceStatus === "accept") {
                return job;
            }
        })
    )
    const start = (page - 1) * limit;
    const end = limit;
    return { length: mappedFavoriteJobs.length, listFavoriteJob: mappedFavoriteJobs.slice(start, end) };
}

favoriteJobSchema.statics.removeAllFavoriteJob = async function ({ userId }) {
    // check đã có list chưa
    const listFavoriteJob = await this.findOne({ candidateId: userId });
    if (!listFavoriteJob) {
        throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
    }
    if (listFavoriteJob.favoriteJobs.length === 0) {
        throw new BadRequestError("Không có công việc nào trong danh sách.");
    }
    listFavoriteJob.favoriteJobs = [];
    await listFavoriteJob.save();
    return { length: 0, listFavoriteJob: [] };
}

module.exports = {
    FavoriteJob: model('FavoriteJob', favoriteJobSchema)
};