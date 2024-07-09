const { Admin } = require('../models/admin.model');
const { acceptanceStatus } = require('../utils');

class AdminService {
    static getInformation = async ({ userId }) => {
        try {
            const adminInfor = await Admin.findById(userId).populate("loginId").lean().select(
                '-createdAt -updatedAt -__v'
            );
            adminInfor.role = adminInfor.loginId?.role;
            delete adminInfor.loginId;
            return {
                message: "Lấy thông tin thành công",
                metadata: { ...adminInfor },
            }
        } catch (error) {
            throw error;
        }
    }

    static getListAcceptanceStatus = async () => {
        try {
            return {
                message: "Lấy danh sách trạng thái thành công",
                metadata: { listAcceptanceStatus: acceptanceStatus },
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminService;