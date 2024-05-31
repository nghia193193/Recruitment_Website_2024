const AdminService = require("../services/admin.service");
const { CREATED, OK } = require('../core/success.response');
const AdminValidation = require("../validations/admin.validation");
const { BadRequestError } = require("../core/error.response");

class AdminController {
    getInformation = async (req, res, next) => {
        const { metadata, message } = await AdminService.getInformation(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListRecruiter = async (req, res, next) => {
        const { error, value } = AdminValidation.validateGetListRecruiter(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await AdminService.getListRecruiter({ ...req.body, ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getRecruiterInformation = async (req, res, next) => {
        const { error, value } = AdminValidation.validateRecruiterId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await AdminService.getRecruiterInformation({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    approveRecruiter = async (req, res, next) => {
        const { error, value } = AdminValidation.validateApproveRecruiter({ ...req.params, ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AdminService.approveRecruiter({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
        }).send(res)
    }

    getListAcceptanceStatus = async (req, res, next) => {
        const { metadata, message } = await AdminService.getListAcceptanceStatus();
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    approveJob = async (req, res, next) => {
        const { error, value } = AdminValidation.validateApproveJob({ ...req.params, ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AdminService.approveJob({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
        }).send(res)
    }
}

module.exports = new AdminController;