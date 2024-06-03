const { formatInTimeZone } = require("date-fns-tz");
const { BadRequestError, InternalServerError } = require("../core/error.response");
const { FavoriteResume } = require("../models/favoriteResume");
const { Resume } = require("../models/resume.model");

class FavoriteResumeService {
    static getListFavoriteResume = async ({ userId, searchText, educationLevel, experience, major, page, limit }) => {
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
            if (educationLevel) query["educationLevel"] = educationLevel;
            if (experience) query["experience"] = experience;
            if (major) query["major"] = major;
            if (searchText) {
                query["$or"] = [
                    { title: new RegExp(searchText, "i") },
                    { name: new RegExp(searchText, "i") },
                    { english: new RegExp(searchText, "i") }
                ]
            }
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
                console.log(resume)
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
                    exist: false
                }
            }
            // check có resume trong list chưa
            if (recruiter.favoriteResumes.includes(resumeId)) {
                return {
                    message: "Bạn đã thêm resume vào mục yêu thích",
                    exist: true
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