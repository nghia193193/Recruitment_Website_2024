const { NotFoundRequestError, BadRequestError } = require('../core/error.response');
const { Admin } = require('../models/admin.model');
const { Recruiter } = require('../models/recruiter.model');

class AdminService {

    static getInformation = async ({ userId }) => {
        try {
            const admin = await Admin.getInformation({ userId });
            if (!admin) {
                throw new NotFoundRequestError("Không tìm thấy người dùng");
            }
            return {
                message: "Lấy thông tin thành công",
                metadata: { ...admin },
            }
        } catch (error) {
            throw error;
        }
    }

    static getListRecruiter = async ({ userId, name, status, page, limit }) => {
        try {
            //checkExist
            const isExist = await Admin.findById(userId).lean();
            if (!isExist) {
                throw new NotFoundRequestError("Không tìm thấy người dùng");
            }
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { totalElement, listRecruiter } = await Recruiter.getListRecruiter({ name, status, page, limit });
            return {
                message: "Lấy danh sách nhà tuyển dụng thành công",
                metadata: { listRecruiter, totalElement },
                options: {
                    page: page,
                    limit: limit
                }
            }
        } catch (error) {
            throw error;
        }

    }

    static changeRecruiterStatus = async ({ userId, recruiterId, status }) => {
        try {
            //checkExist
        const isExist = await Admin.findById(userId).lean();
        if (!isExist) {
            throw new NotFoundRequestError("Không tìm thấy người dùng");
        }
        const result = await Recruiter.changeRecruiterStatus({ recruiterId, status });
        if (!result) {
            throw new NotFoundRequestError("Không tìm thấy nhà tuyển dụng");
        }
        return {
            message: "Thay đổi trạng thái thành công",
            metadata: { ...result },
        }
        } catch (error) {
            throw error;
        }       
    }
}

module.exports = AdminService;