const AdminService = require("../services/admin.service");
const { OK } = require('../core/success.response');

class AdminController {
    getInformation = async (req, res, next) => {
        const { metadata, message } = await AdminService.getInformation(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListAcceptanceStatus = async (req, res, next) => {
        const { metadata, message } = await AdminService.getListAcceptanceStatus();
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new AdminController();