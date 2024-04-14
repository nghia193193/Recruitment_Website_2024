const { NotFoundRequestError } = require('../core/error.response');
const { Admin } = require('../models/admin.model');
const { Recruiter } = require('../models/recruiter.model');

class AdminService {

    static getInactiveRecruiters = async ({ userId }) => {
        //checkExist
        const isExist = await Admin.findById(userId).lean();
        if (!isExist) {
            throw new NotFoundRequestError("Không tìm thấy người dùng");
        }
        const result = await Recruiter.getRecruiterByStatus("inactive");
        return {
            message: "Lấy danh sách nhà tuyển dụng thành công",
            metadata: {...result},
            options: {
                page: 1,
                limit: 1
            }
        }
    }
}

module.exports = AdminService;