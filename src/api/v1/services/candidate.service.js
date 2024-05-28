const { Candidate } = require("../models/candidate.model");
const { FavoriteJob } = require("../models/favoriteJob.model");
const { Resume } = require("../models/resume.model");
const { Login } = require("../models/login.model");
const { InternalServerError, BadRequestError } = require("../core/error.response");
const { v2: cloudinary } = require('cloudinary');
const { Application } = require("../models/application.model");
const { Job } = require("../models/job.model");
const mongoose = require("mongoose");
const { formatInTimeZone } = require("date-fns-tz");
const { Notification } = require("../models/notification.model");
const { FavoriteRecruiter } = require("../models/favoriteRecruiter.model");
const ObjectId = mongoose.Types.ObjectId;

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

    static updateInformation = async ({ userId, name, phone, gender, homeTown, workStatus, dateOfBirth, 
        allowSearch, listResume }) => {
        try {
            const candidate = await Candidate.updateInformation({ userId, name, phone, gender, homeTown, workStatus, 
                dateOfBirth, allowSearch, listResume });
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

    static getListFavoriteRecruiter = async ({ userId, page, limit, searchText }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { length, listFavoriteRecruiter } = await FavoriteRecruiter.getListFavoriteRecruiter({ userId, page, limit, searchText });
            return {
                message: "Lấy danh sách nhà tuyển dụng yêu thích thành công.",
                metadata: { listFavoriteRecruiter, totalElement: length },
                options: { page, limit }
            }
        } catch (error) {
            throw error;
        }
    }

    static checkFavoriteJob = async ({ userId, jobId }) => {
        try {
            const { message, exist } = await FavoriteJob.checkFavoriteJob({ userId, jobId });
            return {
                message, 
                metadata: { exist }
            }
        } catch (error) {
            throw error;
        }
    }

    static checkFavoriteRecruiter = async ({ userId, recruiterId }) => {
        try {
            const { message, exist } = await FavoriteRecruiter.checkFavoriteRecruiter({ userId, recruiterId });
            return {
                message, 
                metadata: { exist }
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

    static addFavoriteRecruiter = async ({ userId, recruiterId }) => {
        try {
            await FavoriteRecruiter.addFavoriteRecruiter({ userId, recruiterId });
            return {
                message: "Thêm nhà tuyển dụng yêu thích thành công.",
                metadata: {}
            }
        } catch (error) {
            throw error;
        }
    }

    static removeFavoriteJob = async ({ userId, jobId, page, limit, name }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { length, listFavoriteJob } = await FavoriteJob.removeFavoriteJob({ userId, jobId, page, limit, name });
            return {
                message: "Xóa công việc yêu thích thành công.",
                metadata: { listFavoriteJob, totalElement: length },
                options: { page, limit }
            }
        } catch (error) {
            throw error;
        }
    }

    static removeFavoriteRecruiter = async ({ userId, recruiterId, page, limit, searchText }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { length, listFavoriteRecruiter } = await FavoriteRecruiter.removeFavoriteRecruiter({ userId, recruiterId, page, limit, searchText });
            return {
                message: "Xóa nhà tuyển dụng yêu thích thành công.",
                metadata: { listFavoriteRecruiter, totalElement: length },
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

    static removeAllFavoriteRecruiter = async ({ userId }) => {
        try {
            const { length, listFavoriteRecruiter } = await FavoriteRecruiter.removeAllFavoriteRecruiter({ userId });
            return {
                message: "Xóa toàn bộ nhà tuyển dụng yêu thích thành công.",
                metadata: { listFavoriteRecruiter, totalElement: length },
            }
        } catch (error) {
            throw error;
        }
    }

    static getListResume = async ({ userId, page, limit, title, status }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { length, listResume } = await Resume.getListResume({ userId, page, limit, title, status });
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

    static addResume = async ({ userId, name, title, avatar, goal, phone, educationLevel, homeTown, email, major,
        dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories }) => {
        try {
            const resume = await Resume.addResume({
                userId, name, title, avatar, goal, phone, educationLevel, homeTown, email, major,
                dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories
            });
            return {
                message: "Thêm resume thành công."
            }
        } catch (error) {
            throw error;
        }
    }

    static updateResume = async ({ userId, resumeId, name, title, avatar, goal, phone, educationLevel, homeTown, email, major,
        dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories }) => {
        try {
            const resume = await Resume.updateResume({
                userId, resumeId, name, title, avatar, goal, phone, educationLevel, homeTown, email, major,
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
            if (job.status !== "active" || job.acceptanceStatus !== "accept" || new Date(job.deadline) < Date.now()) {
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
                    resumeId: resumeId
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

    static getListApplication = async ({ userId, name, page, limit, status }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const pipeline = [
                {
                    $lookup: {
                        from: "jobs",
                        localField: "jobId",
                        foreignField: "_id",
                        as: "jobs"
                    }
                },
                {
                    $unwind: "$jobs"
                },
                {
                    $lookup: {
                        from: "recruiters",
                        localField: "jobs.recruiterId",
                        foreignField: "_id",
                        as: "recruiter"
                    }
                },
                {
                    $unwind: "$recruiter"
                },
                {
                    $match: {
                        "candidateId": new ObjectId(userId)
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "jobId": 1,
                        "jobs.name": 1,
                        "jobs.levelRequirement": 1,
                        "jobs.field": 1,
                        "recruiter.companyName": 1,
                        "jobs.deadline": 1,
                        "updatedAt": 1,
                        "status": 1
                    }
                }
            ]
            if (name) {
                pipeline.push({ $match: { "jobs.name": new RegExp(name, "i") } });
            }
            if (status) {
                pipeline.push({ $match: { "status": status } });
            }
            const totalDocument = await Application.aggregate([...pipeline, { $count: "totalDocuments" }]);
            const totalElement = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
            let listApplication = await Application.aggregate(
                [...pipeline, {
                    $sort: { updatedAt: -1 }
                }, {
                    $skip: (page - 1) * limit
                }, {
                    $limit: limit
                }]
            )
            listApplication = listApplication.map((item, index) => {
                item.name = item.jobs.name;
                item.levelRequirement = item.jobs.levelRequirement;
                item.field = item.jobs.field,
                item.deadline = formatInTimeZone(item.jobs.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy"); 
                item.companyName = item.recruiter.companyName;
                delete item.jobs;
                delete item.recruiter;
                return {
                    STT: index + 1,
                    ...item
                }
            })
            return {
                message: "Lấy danh sách công việc ứng tuyển thành công.",
                metadata: { listApplication, totalElement },
                options: { page, limit }
            }
        } catch (error) {
            throw error;
        }
    }

    static getListNotification = async ({ userId }) => {
        try {
            const listNotification = await Notification.getListNotification({ userId })
            return {
                message: "Lấy danh sách thông báo thành công",
                metadata: { listNotification }
            }
        } catch (error) {
            throw error;
        }
    }

    static readNotification = async ({ userId, notificationId }) => {
        try {
            await Notification.readNotification({ userId, notificationId })
            return {
                message: "Đọc thông báo thành công"
            }
        } catch (error) {
            throw error;
        }
    }

}

module.exports = CandidateService;