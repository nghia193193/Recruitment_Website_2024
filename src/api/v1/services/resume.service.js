const { formatInTimeZone } = require("date-fns-tz");
const { InternalServerError } = require("../core/error.response");
const { Resume } = require("../models/resume.model");
const { clearImage } = require("../utils/processImage");

class ResumeService {
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
        dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories, themeId }) => {
        try {
            const resume = await Resume.create({
                candidateId: userId, name, title, avatar, goal, phone, educationLevel, homeTown, email, major,
                dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories, themeId
            });
            if (!resume) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            return {
                message: "Thêm resume thành công."
            }
        } catch (error) {
            throw error;
        }
    }

    static updateResume = async ({ userId, resumeId, name, title, avatar, goal, phone, educationLevel, homeTown, email, major,
        dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories, themeId }) => {
        try {
            const resume = await Resume.findOne({ _id: resumeId, candidateId: userId });
            if (!resume) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            if (avatar) {
                const oldAva = resume.avatar;
                const splitArr = oldAva.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            const result = await Resume.findOneAndUpdate({ _id: resumeId, candidateId: userId }, {
                $set: {
                    name, title, goal, phone, educationLevel, homeTown, email, major, avatar, themeId,
                    dateOfBirth, english, jobType, experience, GPA, activity, certifications, educations, workHistories
                }
            }, {
                new: true,
                select: { __v: 0, candidateId: 0 }
            }).lean();
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            result.createdAt = formatInTimeZone(result.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
            result.updatedAt = formatInTimeZone(result.updatedAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
            return {
                message: "Cập nhật resume thành công.",
                metadata: { ...result }
            }
        } catch (error) {
            if (avatar) {
                const splitArr = avatar.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
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
            const splitArr = result.avatar.split("/");
            const image = splitArr[splitArr - 1];
            clearImage(image);
            // loop certification
            if (result.certifications.length !== 0) {
                for (let i = 0; i < result.certifications.length; i++) {
                    const splitArr = result.certifications[i].uploadFile.split("/");
                    const image = splitArr[splitArr - 1];
                    clearImage(image);
                }
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

    static advancedSearchForPremium = async ({ title, educationLevel, homeTown, english, jobType, experience, major, page, limit }) => {
        try {
            page = page ? page : 1;
            limit = limit ? limit : 5;
            const query = {
                status: "active",
                allowSearch: true
            }
            if (title) {
                query["$text"] = { $search: `"${title}"` };
            }
            if (educationLevel) query["educationLevel"] = educationLevel;
            if (homeTown) query["homeTown"] = homeTown;
            if (jobType) query["jobType"] = jobType;
            if (experience) query["experience"] = experience;
            if (english) query["english"] = english;
            if (major) query["major"] = major;
            const length = await Resume.find(query).countDocuments();
            const result = await Resume.find(query).select("-__v -candidateId -allowSearch")
                .sort({ updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
            return {
                message: "Tìm kiếm ứng viên thành công",
                metadata: {
                    listResume: result,
                    totalElement: length
                },
                options: {
                    page,
                    limit
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static getListEnglishResume = async () => {
        try {
            const query = {
                status: "active",
                allowSearch: true
            }
            let result = await Resume.find(query).select("english").lean();
            result = [...new Set(result.map(item => item.english))];
            return { result, length: result.length };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ResumeService;