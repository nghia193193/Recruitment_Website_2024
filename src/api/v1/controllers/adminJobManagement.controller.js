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

    getJobDetail = async (req, res, next) => {
        const { error, value } = AdminJobManagementValidation.validateJobId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await AdminJobManagementService.getJobDetail(value);
        new OK({
            message,
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

    banJob = async (req, res, next) => {
        const { error, value } = AdminJobManagementValidation.validateBanJob({ ...req.params, ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        await AdminJobManagementService.banJob({ ...value });
        new OK({
            message: "Xử lí ban công việc thành công",
            metadata: {}
        }).send(res)
    }

    getListReportedJob = async (req, res, next) => {
        const { error, value } = AdminJobManagementValidation.validateListReportedJob(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await AdminJobManagementService.getListReportedJob(value);
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }
}

module.exports = new AdminJobManagementController();