const { Candidate } = require("../models/candidate.model");
const { FavoriteJob } = require("../models/favoriteJob.model");
const { Resume } = require("../models/resume.model");
const { Login } = require("../models/login.model");
const { InternalServerError, BadRequestError } = require("../core/error.response");
const { v2: cloudinary } = require('cloudinary');
const { Application } = require("../models/application.model");
const { Job } = require("../models/job.model");

class CandidateService {
    static getInformation = async ({ userId }) => {
        try {
            const candidate = await Candidate.getInformation(userId);
            return {
                message: "Lấy thông tin thành công",
                metadata: { ...candidate }
            }
        } catch (error) {
            throw error;
        }
    }

    static updateInformation = async ({ userId, name, phone, gender, homeTown, workStatus, dateOfBirth }) => {
        try {
            const candidate = await Candidate.updateInformation({ userId, name, phone, gender, homeTown, workStatus, dateOfBirth });
            return {
                message: "Cập nhật thông tin thành công",
                metadata: { ...candidate }
            }
        } catch (error) {
            throw error;
        }
    }

    static updateAvatar = async ({ userId, avatar }) => {
        try {
            const candidate = await Candidate.updateAvatar({ userId, avatar });
            return {
                message: "Cập nhật ảnh đại diện thành công",
                metadata: { ...candidate }
            }
        } catch (error) {
            throw error;
        }
    }

    static changePassword = async ({ userId, currentPassword, newPassword }) => {
        try {
            const email = (await Candidate.findById(userId).lean()).email;

            const { message } = await Login.changePassword({ email, currentPassword, newPassword });
            return {
                message: message
            }
        } catch (error) {
            throw error;
        }
    }

    static getListFavoriteJob = async ({ userId, page, limit, name }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { length, listFavoriteJob } = await FavoriteJob.getListFavoriteJob({ userId, page, limit, name });
            return {
                message: "Lấy danh sách công việc yêu thích thành công.",
                metadata: { listFavoriteJob, totalElement: length },
                options: { page, limit }
            }
        } catch (error) {
            throw error;
        }
    }

    static addFavoriteJob = async ({ userId, jobId }) => {
        try {
            await FavoriteJob.addFavoriteJob({ userId, jobId });
            return {
                message: "Thêm công việc yêu thích thành công.",
                metadata: {}
            }
        } catch (error) {
            throw error;
        }
    }

    static removeFavoriteJob = async ({ userId, jobId, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { length, listFavoriteJob } = await FavoriteJob.removeFavoriteJob({ userId, jobId, page, limit });
            return {
                message: "Xóa công việc yêu thích thành công.",
                metadata: { listFavoriteJob, totalElement: length },
                options: { page, limit }
            }
        } catch (error) {
            throw error;
        }
    }

    static removeAllFavoriteJob = async ({ userId }) => {
        try {
            const { length, listFavoriteJob } = await FavoriteJob.removeAllFavoriteJob({ userId });
            return {
                message: "Xóa toàn bộ công việc yêu thích thành công.",
                metadata: { listFavoriteJob, totalElement: length },
            }
        } catch (error) {
            throw error;
        }
    }

    static getListResume = async ({ userId, page, limit, title }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { length, listResume } = await Resume.getListResume({ userId, page, limit, title });
            return {
                message: "Lấy danh sách resume thành công.",
                metadata: { listResume, totalElement: length },
                options: { page, limit }
            }
        } catch (error) {
            throw error;
        }
    }

    static getResumeDetail = async ({ userId, resumeId }) => {
        try {
            const resume = await Resume.getResumeDetail({ userId, resumeId });
            return {
                message: "Lấy thông tin resume thành công.",
                metadata: { ...resume }
            }
        } catch (error) {
            throw error;
        }
    }

    static addResume = async ({ userId, name, title, avatar, goal, phone, educationLevel, homeTown,
        dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories }) => {
        try {
            const resume = await Resume.addResume({
                userId, name, title, avatar, goal, phone, educationLevel, homeTown,
                dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories
            });
            return {
                message: "Thêm resume thành công."
            }
        } catch (error) {
            throw error;
        }
    }

    static updateResume = async ({ userId, resumeId, name, title, avatar, goal, phone, educationLevel, homeTown,
        dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories }) => {
        try {
            const resume = await Resume.updateResume({
                userId, resumeId, name, title, avatar, goal, phone, educationLevel, homeTown,
                dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories
            });
            return {
                message: "Cập nhật resume thành công.",
                metadata: { ...resume }
            }
        } catch (error) {
            throw error;
        }
    }

    static deleteResume = async ({ userId, resumeId, page, limit, title }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const result = await Resume.findOneAndDelete({ _id: resumeId, candidateId: userId });
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            if (result.avatar?.publicId) {
                await cloudinary.uploader.destroy(result.avatar.publicId);
            }
            const { length, listResume } = await Resume.getListResume({ userId, page, limit, title })
            return {
                message: "Xóa resume thành công.",
                metadata: { listResume, totalElement: length },
                options: {
                    page, limit
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static changeResumeStatus = async ({ userId, resumeId, status }) => {
        try {
            const resume = await Resume.changeStatus({
                userId, resumeId, status
            });
            return {
                message: "Thay đổi trạng thái thành công.",
                metadata: { ...resume }
            }
        } catch (error) {
            throw error;
        }
    }

    static uploadCertification = async ({ uploadFile }) => {
        try {
            const result = await cloudinary.uploader.upload(uploadFile.tempFilePath);
            if (!result) {
                throw InternalServerError("Upload thất bại");
            };
            const publicId = result.public_id;
            const url = cloudinary.url(publicId);
            return {
                message: "Upload thành công.",
                metadata: { Id: publicId, url }
            }
        } catch (error) {
            throw error;
        }
    }

    static deleteUploadCertification = async ({ Id }) => {
        try {
            await cloudinary.uploader.destroy(Id);
            return {
                message: "Xóa file thành công.",
            }
        } catch (error) {
            throw error;
        }
    }

    static checkApplyJob = async ({ userId, jobId }) => {
        try {
            //check job
            const job = await Job.findById(jobId).lean();
            if (!job) {
                throw new BadRequestError("Không tìm thấy công việc.");
            }
            const application = await Application.findOne({ candidateId: userId, jobId: jobId }).lean();
            if (application) {
                return {
                    message: "Bạn đã ứng tuyển vào công việc này rồi.",
                    metadata: { apply: true }
                }
            }
            return {
                message: "Bạn chưa ứng tuyển vào công việc này.",
                metadata: { apply: false }
            }
        } catch (error) {
            throw error;
        }
    }

    static applyJob = async ({ userId, jobId, resumeId }) => {
        try {
            // check job
            const job = await Job.findById(jobId).lean();
            if (!job) {
                throw new BadRequestError("Không tìm thấy công việc.");
            }
            if (job.status !== "active" || job.acceptanceStatus !== "accept") {
                throw new BadRequestError("Có lỗi xảy ra vui lòng thử lại.");
            }
            // check resume
            const resume = await Resume.findOne({ _id: resumeId, candidateId: userId }).lean();
            if (!resume || resume.candidateId.toString() !== userId) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            if (resume.status === "inactive") {
                throw new BadRequestError("Vui lòng kích hoạt resume để ứng tuyển.");
            }
            // check apply
            const application = await Application.findOne({ candidateId: userId, jobId: jobId }).lean();
            if (application?.status) {
                if (application.status !== "Đã nộp") {
                    throw new BadRequestError("Đơn ứng tuyển đã được xử lý rồi.");
                }
            }
            // apply
            const result = await Application.findOneAndUpdate({ candidateId: userId, jobId: jobId }, {
                $set: {
                    resumeId: resumeId,
                    status: "Đã nộp"
                }
            }, {
                new: true,
                upsert: true
            })
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            return {
                message: "Ứng tuyển thành công."
            }
        } catch (error) {
            throw error;
        }
    }

    static cancelApplication = async ({ userId, jobId }) => {
        try {
            // check đơn ứng tuyển
            const application = await Application.findOne({ jobId: jobId, candidateId: userId });
            if (!application) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            if (application.status !== "Đã nộp") {
                throw new BadRequestError("Đơn ứng tuyển của bạn đã được xử lý, không thể hủy.")
            }
            const result = await Application.findOneAndDelete({ jobId: jobId, candidateId: userId });
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            return {
                message: "Hủy ứng tuyển thành công.",
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CandidateService;