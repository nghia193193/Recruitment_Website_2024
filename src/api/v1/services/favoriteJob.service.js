
const { Job } = require('../models/job.model');
const { BadRequestError, InternalServerError } = require('../core/error.response');
const { formatInTimeZone } = require('date-fns-tz');
const { FavoriteJob } = require('../models/favoriteJob.model');
const ApplicationService = require('../services/application.service')

class FavoriteJobService {
    static getListFavoriteJob = async function ({ userId, page, limit, name }) {
        const candidate = await FavoriteJob.findOne({ candidateId: userId });
        if (!candidate) {
            return { length: 0, listFavoriteJob: [] };
        }
        let query = {
            _id: { $in: candidate.favoriteJobs },
            status: "active"
        }
        if (name) {
            query.$text = { $search: `"${name}"` };
        }
        let length = await Job.find(query).lean().countDocuments();
        let result = await Job.find(query)
            .lean().populate("recruiterId")
            .select("-__v -reasonDecline")
            .sort({ approvalDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
        let listFavoriteJob = await Promise.all(
            result.map(async (job) => {
                const acceptedNumber = await ApplicationService.getJobAcceptedApplicationNumber({ jobId: job._id });
                job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
                job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                job.approvalDate = job.approvalDate ? formatInTimeZone(job.approvalDate, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX") : undefined;
                job.companyName = job.recruiterId.companyName ?? null;
                job.companySlug = job.recruiterId.slug ?? null;
                job.companyLogo = job.recruiterId.companyLogo ?? null;
                job.employeeNumber = job.recruiterId.employeeNumber;
                job.companyAddress = job.recruiterId.companyAddress;
                job.acceptedNumber = acceptedNumber;
                delete job.recruiterId;
                return job;
            })
        )
        return { length, listFavoriteJob };
    }

    static checkFavoriteJob = async function ({ userId, jobId }) {
        // check có job này không
        const job = await Job.findById(jobId).lean();
        if (!job) {
            throw new BadRequestError("Không tìm thấy công việc này, vui lòng thử lại");
        }
        if (job.status !== "active") {
            throw new BadRequestError("Hiện tại không thể thêm công việc này");
        }
        // check đã có list chưa
        const listFavoriteJob = await FavoriteJob.findOne({ candidateId: userId });
        if (!listFavoriteJob) {
            return {
                message: "Chưa thêm công việc vào công việc yêu thích.",
                exist: false
            }
        }
        // check job đã có trong list chưa
        if (listFavoriteJob.favoriteJobs.includes(jobId)) {
            return {
                message: "Đã thêm công việc vào công việc yêu thích.",
                exist: true
            }
        }
        return {
            message: "Chưa thêm công việc vào công việc yêu thích.",
            exist: false
        }
    }

    static addFavoriteJob = async function ({ userId, jobId }) {
        // check có job này không
        const job = await Job.findById(jobId).lean();
        if (!job) {
            throw new BadRequestError("Không tìm thấy công việc này, vui lòng thử lại");
        }
        if (job.status !== "active" !== "accept") {
            throw new BadRequestError("Hiện tại không thể thêm công việc này");
        }
        // check đã có list chưa
        const listFavoriteJob = await FavoriteJob.findOne({ candidateId: userId });
        if (!listFavoriteJob) {
            return await FavoriteJob.create({ candidateId: userId, favoriteJobs: [jobId] });
        }
        // check job đã có trong list chưa
        if (listFavoriteJob.favoriteJobs.includes(jobId)) {
            throw new BadRequestError("Bạn đã thêm công việc này vào công việc yêu thích rồi.");
        }
        listFavoriteJob.favoriteJobs.push(jobId);
        await listFavoriteJob.save();
    }

    static removeFavoriteJob = async function ({ userId, jobId, page, limit, name }) {
        // check đã có list chưa
        const candidate = await FavoriteJob.findOne({ candidateId: userId });
        if (!candidate) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
        }
        // check job đã có trong list chưa
        if (!candidate.favoriteJobs.includes(jobId)) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
        }
        candidate.favoriteJobs = candidate.favoriteJobs.filter(job => job !== jobId);
        await candidate.save();
        // trả về list đã xóa 
        const { length, listFavoriteJob } = await this.getListFavoriteJob({ userId, page, limit, name });
        return { length, listFavoriteJob };
    }

    static removeListFavoriteJob = async function ({ userId, listJobId }) {
        // check đã có list chưa
        const candidate = await FavoriteJob.findOne({ candidateId: userId });
        if (!candidate) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
        }
        // check job đã có trong list chưa
        if (!listJobId.every(item => candidate.favoriteJobs.includes(item))) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
        }
        for (let i = 0; i < listJobId.length; i++){
            candidate.favoriteJobs = candidate.favoriteJobs.filter(item => item !== listJobId[i]);
        }
        await candidate.save();
    }

    static removeAllFavoriteJob = async function ({ userId }) {
        // check đã có list chưa
        const listFavoriteJob = await FavoriteJob.findOne({ candidateId: userId });
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
}

module.exports = FavoriteJobService;