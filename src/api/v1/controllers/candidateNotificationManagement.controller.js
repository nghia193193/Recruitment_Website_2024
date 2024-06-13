const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");
const CandidateNotificationManagementService = require("../services/candidateNotificationManagement.service");
const CandidateNotificationManagementValidation = require("../validations/candidateNotificationManagement.validation");

class CandidateNotificationManagementController {
    getListNotification = async (req, res, next) => {
        const { metadata, message } = await CandidateNotificationManagementService.getListNotification(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    readNotification = async (req, res, next) => {
        const { error, value } = CandidateNotificationManagementValidation.validateNotificationId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await CandidateNotificationManagementService.readNotification({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    removeNotification = async (req, res, next) => {
        const { error, value } = CandidateNotificationManagementValidation.validateNotificationId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await CandidateNotificationManagementService.removeNotification({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    removeAllNotification = async (req, res, next) => {
        const { metadata, message } = await CandidateNotificationManagementService.removeAllNotification(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new CandidateNotificationManagementController();