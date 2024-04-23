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
        const { error } = AdminValidation.validateGetListRecruiter(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await AdminService.getListRecruiter({ ...req.body, ...req.query });
        new OK({
            message: message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    approveRecruiter = async (req, res, next) => {
        const { error } = AdminValidation.validateRecruiterId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AdminService.approveRecruiter({ ...req.params });
        new OK({
            message: message,
            metadata: { ...metadata },
        }).send(res)
    }

    changeRecruiterStatus = async (req, res, next) => {
        const { error: statusError } = AdminValidation.validateRecruiterStatus(req.body);
        const { error: idError } = AdminValidation.validateRecruiterId(req.params);
        console.log(idError)
        if (statusError || idError) {
            const errors = [];
            if (statusError) errors.push(statusError.details[0].message);
            if (idError) errors.push(idError.details[0].message);
            throw new BadRequestError(errors[0]);
        }
        const { metadata, message } = await AdminService.changeRecruiterStatus({ ...req.body, ...req.params });
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

    getListJob = async (req, res, next) => {
        const { error, value } = AdminValidation.validateGetListJob(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await AdminService.getListJob({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getJobDetail = async (req, res, next) => {
        const { error, value } = AdminValidation.validateJobId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AdminService.getJobDetail({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
        }).send(res)
    }

    approveJob = async (req, res, next) => {
        const { error, value } = AdminValidation.validateApproveJob({ ...req.params, ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AdminService.approveJob({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
        }).send(res)
    }
}

module.exports = new AdminController;