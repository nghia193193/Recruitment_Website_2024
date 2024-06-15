const joi = require("joi");

class RecruiterStatisticValidation {
    static validateApplicationStatistic = data => {
        const validateSchema = joi.object({
            startDate: joi.date().iso().required(),
            endDate: joi.date().iso().required()
        })
        return validateSchema.validate(data);
    }

    static validateApplicationStatisticByMonth = data => {
        const validateSchema = joi.object({
            month: joi.number().min(1).max(12).required(),
            year: joi.number().min(1).required()
        })
        return validateSchema.validate(data);
    }

    static validateApplicationStatisticByYear = data => {
        const validateSchema = joi.object({
            year: joi.number().min(1).required()
        })
        return validateSchema.validate(data);
    }
}

module.exports = RecruiterStatisticValidation;