const { Candidate } = require("../models/candidate.model");
const { FavoriteJob } = require("../models/favoriteJob.model");
const { Resume } = require("../models/resume.model");

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

    static getListFavoriteJob = async ({ userId, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { length, listFavoriteJob } = await FavoriteJob.getListFavoriteJob({ userId, page, limit });
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

    static getListResume = async ({ userId, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { length, listResume } = await Resume.getListResume({ userId, page, limit });
            return {
                message: "Lấy danh sách resume thành công.",
                metadata: { listResume, totalElement: length },
                options: { page, limit }
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
                message: "Thêm resume thành công.",
                metadata: { ...resume }
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CandidateService;