const { OK } = require("../core/success.response");
const RecruiterPaymentService = require("../services/recruiterPayment.service");
const RecruiterPaymentValidation = require("../validations/recruiterPayment.validation");

class RecruiterPaymentController {
    createPayment = async (req, res, next) => {
        const { error, value } = RecruiterPaymentValidation.validateCreatePayment(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        var ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        const { metadata, message } = await RecruiterPaymentService.createPayment({ ...req.payload, ...value, ipAddr });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getVNPayIPN = async (req, res, next) => {
        const { metadata, message } = await RecruiterPaymentService.getVNPayIPN({ reqQuery: req.query });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new RecruiterPaymentController();