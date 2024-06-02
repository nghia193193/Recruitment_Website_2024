const { Resume } = require("../models/resume.model");

class ResumeService {
    static advancedSearchForPremium = async ({ title, educationLevel, english, jobType, experience, major, page, limit }) => {
        try {
            page = page ? page : 1;
            limit = limit ? limit : 5;
            const query = {
                status: "active",
                allowSearch: true
            }
            const searchFields = [title, educationLevel, english, experience].filter(Boolean);
            if (searchFields.length > 0) {
                query["$text"] = {
                    $search: searchFields.join(" ")
                };
            }
            if (jobType) query["jobType"] = jobType;
            if (major) query["major"] = major;
            const length = await Resume.find(query).countDocuments();
            const result = await Resume.find(query).select("-__v -candidateId -allowSearch")
                .skip((page - 1)*limit)
                .limit(limit)
                .lean()
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
}

module.exports = ResumeService;