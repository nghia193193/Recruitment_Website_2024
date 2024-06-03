const { Resume } = require("../models/resume.model");

class ResumeService {
    static advancedSearchForPremium = async ({ searchText, educationLevel, jobType, experience, major, page, limit }) => {
        try {
            page = page ? page : 1;
            limit = limit ? limit : 5;
            const query = {
                status: "active",
                allowSearch: true
            }
            if (searchText) {
                query["$or"] = [
                    { title: new RegExp(searchText, "i") },
                    { name: new RegExp(searchText, "i") },
                    { english: new RegExp(searchText, "i") }
                ]
            }
            if (educationLevel) query["educationLevel"] = educationLevel;
            if (jobType) query["jobType"] = jobType;
            if (experience) query["experience"] = experience;
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
}

module.exports = ResumeService;