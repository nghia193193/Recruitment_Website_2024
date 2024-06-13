const RecruiterNotificationService = require("../services/recruiterNotification.service");
const RecruiterNotificationValidation = require("../validations/recruiterNotification.validation");
const { OK } = require("../core/success.response");
const { BadRequestError } = require("../core/error.response");

class RecruiterNotificationController {
    getListNotification = async (req, res, next) => {
        const { metadata, message } = await RecruiterNotificationService.getListNotification(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    readNotification = async (req, res, next) => {
        const { error, value } = RecruiterNotificationValidation.validateNotificationId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterNotificationService.readNotification({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    removeNotification = async (req, res, next) => {
        const { error, value } = RecruiterNotificationValidation.validateNotificationId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterNotificationService.removeNotification({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    removeAllNotification = async (req, res, next) => {
        const { metadata, message } = await RecruiterNotificationService.removeAllNotification(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new RecruiterNotificationController();