const RecruiterService = require("../services/recruiter.service");
const RecruiterValidation = require("../validations/recruiter.validation");
const { CREATED, OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const JobValidation = require("../validations/job.validation");

class RecruiterController {

    getInformation = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.getInformation(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateInformation = async (req, res, next) => {
        const { error: bodyError, value: bodyValue } = RecruiterValidation.validateUpdateInformation(req.body);
        const { error: fileError } = RecruiterValidation.validateUpdateFiles(req.files);
        if (bodyError || fileError) {
            const errors = [];
            if (bodyError) errors.push(bodyError.details[0].message);
            if (fileError) errors.push(fileError.details[0].message);
            throw new BadRequestError(errors[0]);
        }
        const { metadata, message } = await RecruiterService.updateInformation({ ...bodyValue, ...req.payload, ...req.files });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    createJob = async (req, res, next) => {
        const { error, value } = JobValidation.validateCreateJob(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.createJob({ ...value, ...req.payload });
        new CREATED({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new RecruiterController;