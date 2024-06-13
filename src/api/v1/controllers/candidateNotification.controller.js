const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");
const CandidateNotificationService = require("../services/candidateNotification.service");
const CandidateNotificationValidation = require("../validations/candidateNotification.validation");

class CandidateNotificationController {
    getListNotification = async (req, res, next) => {
        const { metadata, message } = await CandidateNotificationService.getListNotification(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    readNotification = async (req, res, next) => {
        const { error, value } = CandidateNotificationValidation.validateNotificationId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await CandidateNotificationService.readNotification({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    removeNotification = async (req, res, next) => {
        const { error, value } = CandidateNotificationValidation.validateNotificationId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await CandidateNotificationService.removeNotification({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    removeAllNotification = async (req, res, next) => {
        const { metadata, message } = await CandidateNotificationService.removeAllNotification(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new CandidateNotificationController();