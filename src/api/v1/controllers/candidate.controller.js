const CandidateService = require("../services/candidate.service");
const { OK } = require('../core/success.response');
const CandidateValidation = require("../validations/candidate.validation");
const { BadRequestError } = require("../core/error.response");

class CandidateController {
    getInformation = async (req, res, next) => {
        const { message, metadata } = await CandidateService.getInformation(req.payload);
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateInformation = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateUpdateInformation(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await CandidateService.updateInformation({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateAvatar = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateUpdateAvatar({ ...req.body, ...req.files });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await CandidateService.updateAvatar({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    changePassword = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateChangePassword(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message } = await CandidateService.changePassword({ ...req.payload, ...value })
        new OK({
            message: message
        }).send(res)
    }

    getListFavoriteJob = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateGetListFavoriteJob(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await CandidateService.getListFavoriteJob({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    checkFavoriteJob = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateJobId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await CandidateService.checkFavoriteJob({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
        }).send(res)
    }

    addFavoriteJob = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateJobId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await CandidateService.addFavoriteJob({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
        }).send(res)
    }

    removeFavoriteJob = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateRemoveFavoriteJob({ ...req.query, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await CandidateService.removeFavoriteJob({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    removeAllFavoriteJob = async (req, res, next) => {
        const { message, metadata } = await CandidateService.removeAllFavoriteJob({ ...req.payload });
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListResume = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateGetListResume(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await CandidateService.getListResume({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getResumeDetail = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateResumeId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await CandidateService.getResumeDetail({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    addResume = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateAddResume({ ...req.body, ...req.files });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await CandidateService.addResume({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
        }).send(res)
    }

    updateResume = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateUpdateResume({ ...req.body, ...req.params, ...req.files });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await CandidateService.updateResume({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
        }).send(res)
    }

    deleteResume = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateDeleteResume({ ...req.params, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await CandidateService.deleteResume({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    changeResumeStatus = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateChangeStatus({ ...req.body, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await CandidateService.changeResumeStatus({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
        }).send(res)
    }

    uploadCertification = async (req, res, next) => {
        console.log(req.files)
        const { error, value } = CandidateValidation.validateUploadCertification(req.files);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await CandidateService.uploadCertification({ ...value });
        new OK({
            message,
            metadata: { ...metadata },
        }).send(res)
    }

    deleteUploadCertification = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateDeleteUploadCertification(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await CandidateService.deleteUploadCertification({ ...value });
        new OK({
            message,
            metadata: { ...metadata },
        }).send(res)
    }

    checkApplyJob = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateJobId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await CandidateService.checkApplyJob({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
        }).send(res)
    }

    applyJob = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateApplyJob({ ...req.params, ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await CandidateService.applyJob({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
        }).send(res)
    }

    cancelApplication = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateJobId({ ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await CandidateService.cancelApplication({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
        }).send(res)
    }

    getListApplication = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateGetListApplication(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await CandidateService.getListApplication({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getListNotification = async (req, res, next) => {
        const { metadata, message } = await CandidateService.getListNotification(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    readNotification = async (req, res, next) => {
        const { error, value } = CandidateValidation.validateReadNotification(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await CandidateService.readNotification({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new CandidateController();