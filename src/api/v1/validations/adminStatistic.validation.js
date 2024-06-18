const joi = require("joi");

class AdminStatisticValidation {
    static validateCaculateRevenue = data => {
        const validateSchema = joi.object({
            startDate: joi.date().iso().required(),
            endDate: joi.date().iso().required()
        })
        return validateSchema.validate(data);
    }

    static validateCaculateRevenueByMonth = data => {
        const validateSchema = joi.object({
            month: joi.number().integer().min(1).max(12).required(),
            year: joi.number().integer().min(1).required()
        })
        return validateSchema.validate(data);
    }

    static validateCaculateRevenueByYear = data => {
        const validateSchema = joi.object({
            year: joi.number().integer().min(1).required()
        })
        return validateSchema.validate(data);
    }

    static validateDateFromTo = data => {
        const validateSchema = joi.object({
            startDate: joi.date().iso().required(),
            endDate: joi.date().iso().required()
        })
        return validateSchema.validate(data);
    }

    static validateMonthYear = data => {
        const validateSchema = joi.object({
            month: joi.number().integer().min(1).max(12).required(),
            year: joi.number().integer().min(1).required()
        })
        return validateSchema.validate(data);
    }

    static validateYear = data => {
        const validateSchema = joi.object({
            year: joi.number().integer().min(1).required()
        })
        return validateSchema.validate(data);
    }
}

module.exports = AdminStatisticValidation;