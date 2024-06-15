const AdminJobManagementService = require("../services/adminJobManagement.service");
const AdminJobManagementValidation = require("../validations/adminJobManagement.validation");
const { CREATED, OK } = require('../core/success.response');
const { BadRequestError } = require("../core/error.response");

class AdminJobManagementController {
    createJob = async (req, res, next) => {
        const { error, value } = AdminJobManagementValidation.validateCreateJob({ ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AdminJobManagementService.createJob({ ...value });
        new CREATED({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateJob = async (req, res, next) => {
        const { error, value } = AdminJobManagementValidation.validateUpdateJob({ ...req.body, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AdminJobManagementService.updateJob({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    approveJob = async (req, res, next) => {
        const { error, value } = AdminJobManagementValidation.validateApproveJob({ ...req.params, ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AdminJobManagementService.approveJob({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
        }).send(res)
    }
}

module.exports = new AdminJobManagementController();