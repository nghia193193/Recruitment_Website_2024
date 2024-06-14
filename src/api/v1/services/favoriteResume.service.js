const { formatInTimeZone } = require("date-fns-tz");
const { BadRequestError, InternalServerError } = require("../core/error.response");
const { FavoriteResume } = require("../models/favoriteResume");
const { Resume } = require("../models/resume.model");

class FavoriteResumeService {
    static getListFavoriteResume = async ({ userId, title, educationLevel, homeTown, english, jobType, experience, major, page, limit }) => {
        try {
            page = page ? page : 1;
            limit = limit ? limit : 5;
            // check exist
            const recruiter = await FavoriteResume.findOne({ recruiterId: userId }).lean();
            if (!recruiter) {
                return {
                    message: "Lấy danh sách Resume yêu thích thành công.",
                    metadata: {
                        listFavoriteResume: [],
                        totalElement: 0
                    },
                    options: {
                        page, limit
                    }
                }
            }
            const query = {
                status: "active",
                allowSearch: true,
            }
            if (title) {
                query["$text"] = { $search: `${title}` };
            }
            if (educationLevel) query["educationLevel"] = educationLevel;
            if (homeTown) query["homeTown"] = homeTown;
            if (jobType) query["jobType"] = jobType;
            if (experience) query["experience"] = experience;
            if (english) query["english"] = english;
            if (major) query["major"] = major;
            const length = await Resume.find({ _id: { $in: recruiter.favoriteResumes }, ...query }).countDocuments();
            let listResume = await Resume.find({ _id: { $in: recruiter.favoriteResumes }, ...query })
                .select("-__v -candidateId -status -allowSearch")
                .sort({ updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()

            listResume = listResume.map(resume => {
                resume.dateOfBirth = formatInTimeZone(resume.dateOfBirth, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
                resume.createdAt = formatInTimeZone(resume.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
                resume.updatedAt = formatInTimeZone(resume.updatedAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
                return resume
            })
            return {
                message: "Lấy danh sách Resume yêu thích thành công.",
                metadata: {
                    listFavoriteResume: listResume,
                    totalElement: length
                },
                options: {
                    page, limit
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static checkFavoriteResume = async ({ userId, resumeId }) => {
        try {
            // check resume
            const resume = await Resume.findOne({ _id: resumeId, status: "active", allowSearch: true });
            if (!resume) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            // check có list chưa
            const recruiter = await FavoriteResume.findOne({ recruiterId: userId });
            if (!recruiter) {
                return {
                    message: "Bạn chưa thêm resume vào mục yêu thích",
                    metadata: {
                        exist: false
                    }
                }
            }
            // check có resume trong list chưa
            if (recruiter.favoriteResumes.includes(resumeId)) {
                return {
                    message: "Bạn đã thêm resume vào mục yêu thích",
                    metadata: {
                        exist: true
                    }
                }
            }
            return {
                message: "Bạn chưa thêm resume vào mục yêu thích",
                metadata: {
                    exist: false
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static addFavoriteResume = async ({ userId, resumeId }) => {
        try {
            // check resume
            const resume = await Resume.findOne({ _id: resumeId, status: "active", allowSearch: true });
            if (!resume) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            // check có list chưa
            const recruiter = await FavoriteResume.findOne({ recruiterId: userId });
            if (!recruiter) {
                return await FavoriteResume.create({ recruiterId: userId, favoriteResumes: [resumeId] });
            }
            // check có resume trong list chưa
            if (recruiter.favoriteResumes.includes(resumeId)) {
                throw new BadRequestError("Bạn đã thêm resume vào mục yêu thích rồi.");
            }
            recruiter.favoriteResumes.push(resumeId);
            await recruiter.save();
            return {
                message: "Thêm resume yêu thích thành công."
            }
        } catch (error) {
            throw error;
        }
    }

    static removeFavoriteResume = async ({ userId, resumeId }) => {
        try {
            // check có list chưa
            const recruiter = await FavoriteResume.findOne({ recruiterId: userId });
            if (!recruiter) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            // check có resume trong list chưa
            if (!recruiter.favoriteResumes.includes(resumeId)) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            recruiter.favoriteResumes = recruiter.favoriteResumes.filter(item => item !== resumeId);
            await recruiter.save();
            return {
                message: "Xóa resume yêu thích thành công."
            }
        } catch (error) {
            throw error;
        }
    }

    static removeAllFavoriteResume = async ({ userId }) => {
        try {
            // check có list chưa
            const recruiter = await FavoriteResume.findOne({ recruiterId: userId });
            if (!recruiter) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            if (!recruiter.favoriteResumes.length === 0) {
                throw new BadRequestError("Không có resume nào trong danh sách.");
            }
            recruiter.favoriteResumes = [];
            await recruiter.save();
            return {
                message: "Xóa toàn bộ resume yêu thích thành công",
                metadata: {
                    length: 0,
                    listFavoriteResume: []
                }
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = FavoriteResumeService;