const { Candidate } = require("../models/candidate.model");

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
}

module.exports = CandidateService;