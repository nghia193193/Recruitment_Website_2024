const AdminService = require("../services/admin.service");
const { CREATED, OK } = require('../core/success.response');

class AdminController {
    getInactiveRecruiters = async (req, res, next) => {
        const { metadata, message, options } = await AdminService.getInactiveRecruiters({ ...req.body, ...req.query });
        new OK({
            message: message,
            metadata: { ...metadata },
            options
        }).send(res)
    }
}

module.exports = new AdminController;