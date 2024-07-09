const joi = require('joi');
const mongoose = require('mongoose');
const xss = require('xss');

class ApplicationValidation {
    static validateGetListJobApplication = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            candidateName: joi.string().custom((value) => {
                const cleanName = xss(value.trim());
                return cleanName;
            }),
            experience: joi.string().custom((value) => {
                const cleanExperience = xss(value.trim());
                return cleanExperience;
            }),
            major: joi.string().custom((value) => {
                const cleanMajor = xss(value.trim());
                return cleanMajor;
            }),
            goal: joi.string().custom((value) => {
                const cleanGoal = xss(value.trim());
                return cleanGoal;
            }),
            status: joi.string().valid('Đã nộp', 'Đã nhận', 'Không nhận'),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateJobId = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateApplicationId = data => {
        const validateSchema = joi.object({
            applicationId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }
}

const objectIdValidator = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
};
const objectIdJoiSchema = joi.string().custom(objectIdValidator, 'Custom validation for ObjectId').message("Id không hợp lệ");


module.exports = ApplicationValidation;