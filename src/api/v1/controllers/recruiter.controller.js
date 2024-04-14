const RecruiterService = require("../services/recruiter.service");
const RecruiterValidation = require("../validations/recruiter.validation");
const { CREATED, OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');

class RecruiterController {

    getInformation = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.getInformation(req.payload);
        new OK({
            message: message,
            metadata: {...metadata}
        }).send(res)
    }

    updateInformation = async (req, res, next) => {
        const { error } = RecruiterValidation.updateInformation(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.updateInformation({ ...req.body, ...req.payload });
        new OK({
            message: message,
            metadata: {...metadata}
        }).send(res)
    }
}

module.exports = new RecruiterController;