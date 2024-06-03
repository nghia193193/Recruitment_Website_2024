const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");
const ResumeService = require("../services/resume.service");
const ResumeValidation = require("../validations/resume.validation");

class ResumeController {
    advancedSearchForPremium = async (req, res, next) => {
        const { error, value } = ResumeValidation.validateGetListAdvanced(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await ResumeService.advancedSearchForPremium({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }
}

module.exports = new ResumeController();