const RecruiterNotificationManagemnetService = require("../services/recruiterNotificationManagement.service");
const RecruiterNotificationManagementValidation = require("../validations/recruiterNotificationManagement.validation");
const { OK } = require("../core/success.response");
const { BadRequestError } = require("../core/error.response");

class RecruiterNotificationManagementController {
    getListNotification = async (req, res, next) => {
        const { metadata, message } = await RecruiterNotificationManagemnetService.getListNotification(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    readNotification = async (req, res, next) => {
        const { error, value } = RecruiterNotificationManagementValidation.validateNotificationId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterNotificationManagemnetService.readNotification({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    removeNotification = async (req, res, next) => {
        const { error, value } = RecruiterNotificationManagementValidation.validateNotificationId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterNotificationManagemnetService.removeNotification({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    removeAllNotification = async (req, res, next) => {
        const { metadata, message } = await RecruiterNotificationManagemnetService.removeAllNotification(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new RecruiterNotificationManagementController();