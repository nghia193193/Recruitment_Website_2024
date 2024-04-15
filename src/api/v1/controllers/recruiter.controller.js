const RecruiterService = require("../services/recruiter.service");
const RecruiterValidation = require("../validations/recruiter.validation");
const { CREATED, OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const { file } = require("googleapis/build/src/apis/file");

class RecruiterController {

    getInformation = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.getInformation(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateInformation = async (req, res, next) => {
        const { error: bodyError } = RecruiterValidation.updateInformation(req.body);
        const { error: fileError } = RecruiterValidation.updateInforFiles(req.files);
        console.log(req.files)
        console.log("File Error:", fileError)
        if (bodyError || fileError) {
            const errors = [];
            if (bodyError) errors.push(bodyError.details[0].message);
            if (fileError) errors.push(fileError.details[0].message);
            throw new BadRequestError(errors[0]);
        }
        const { metadata, message } = await RecruiterService.updateInformation({ ...req.body, ...req.payload, ...req.files });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new RecruiterController;