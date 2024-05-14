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
        const { error, value } = CandidateValidation.validatePageLimit(req.query);
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
        const { error, value } = CandidateValidation.validatePageLimit(req.query);
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
}

module.exports = new CandidateController();