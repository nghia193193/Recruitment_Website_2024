const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");
const ApplicationService = require("../services/application.service");
const ApplicationValidation = require("../validations/application.validation");

class ApplicationController {
    getListJobApplication = async (req, res, next) => {
        const { error, value } = ApplicationValidation.validateGetListJobApplication({ ...req.params, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await ApplicationService.getListJobApplication({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getListJobApplicationExperience = async (req, res, next) => {
        const { error, value } = ApplicationValidation.validateJobId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await ApplicationService.getListJobApplicationExperience({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getApplicationDetail = async (req, res, next) => {
        const { error, value } = ApplicationValidation.validateApplicationId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { result } = await ApplicationService.getApplicationDetail(value);
        new OK({
            message: "Lấy thông tin đơn ứng tuyển thành công",
            metadata: { ...result }
        }).send(res)
    }
}

module.exports = new ApplicationController();