const { Candidate } = require('../models/candidate.model');
const { Recruiter } = require('../models/recruiter.model');
const { Job } = require('../models/job.model');

class AdminStatisticService {
    static totalCandidateStatistic = async () => {
        try {
            const number = await Candidate.find({ verifyEmail: true }).countDocuments();
            return {
                message: "Lấy số lượng ứng viên trong hệ thống thành công.",
                metadata: {
                    number
                }
            }
        } catch (error) {
            throw error;
        }
    }
    static totalRecruiterStatistic = async () => {
        try {
            const number = await Recruiter.find({ verifyEmail: true}).countDocuments();
            return {
                message: "Lấy số lượng nhà tuyển dụng trong hệ thống thành công.",
                metadata: {
                    number
                }
            }
        } catch (error) {
            throw error;
        }
    }
    static totalJobStatistic = async () => {
        try {
            const number = await Job.find().countDocuments();
            return {
                message: "Lấy số lượng công việc trong hệ thống thành công.",
                metadata: {
                    number
                }
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminStatisticService;