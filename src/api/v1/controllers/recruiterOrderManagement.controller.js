const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");
const RecruiterOrderManageMentService = require("../services/recruiterOrderManagement.service");
const RecruiterOrderManageMentValidation = require("../validations/recruiterOrderManagement.validation");

class RecruiterOrderManageMentController {
    viewOrder = async (req, res, next) => {
        const { metadata, message } = await RecruiterOrderManageMentService.viewOrder(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    cancelOrder = async (req, res, next) => {
        const { error, value } = RecruiterOrderManageMentValidation.validateCancelOrder(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterOrderManageMentService.cancelOrder({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new RecruiterOrderManageMentController();