const RecruiterService = require("../services/recruiter.service");
const RecruiterValidation = require("../validations/recruiter.validation");
const { CREATED, OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');

class RecruiterController {

    getInformation = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.getInformation(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateInformation = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateUpdateInformation({ ...req.body, ...req.files });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.updateInformation({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateAvatar = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateUpdateAvatar({ ...req.body, ...req.files });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.updateAvatar({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateProfile = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateUpdateProfile(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.updateProfile({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateCompany = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateUpdateCompany({ ...req.body, ...req.files });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.updateCompany({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    changePassword = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateChangePassword(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message } = await RecruiterService.changePassword({ ...req.payload, ...value })
        new OK({
            message: message
        }).send(res)
    }

    createJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateCreateJob(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.createJob({ ...value, ...req.payload });
        new CREATED({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getJobDetail = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateJobId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.getJobDetail({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getJobStatus = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.getJobStatus();
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    changeJobStatus = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateChangeJobStatus({ ...req.body, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.changeJobStatus({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateUpdateJob({ ...req.body, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.updateJob({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListWaitingJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateRecruiterGetListJob({ ...req.body, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await RecruiterService.getListWaitingJob({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getListAcceptedJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateRecruiterGetListJob({ ...req.body, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await RecruiterService.getListAcceptedJob({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getListDeclinedJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateRecruiterGetListJob({ ...req.body, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await RecruiterService.getListDeclinedJob({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getListNearingExpirationdJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateRecruiterGetListJob({ ...req.body, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await RecruiterService.getListNearingExpirationdJob({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getListExpiredJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateRecruiterGetListJob({ ...req.body, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await RecruiterService.getListExpiredJob({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getListJobApplication = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateGetListJobApplication({ ...req.params, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await RecruiterService.getListJobApplication({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getApplicationDetail = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateApplicationId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.getApplicationDetail({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    approveApplication = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateApproveApplication({ ...req.params, ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const companyName = req.recruiter.companyName;
        const { metadata, message } = await RecruiterService.approveApplication({ ...value, ...req.payload, companyName });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListApplicationStatus = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.getListApplicationStatus();
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListNotification = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.getListNotification(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new RecruiterController;