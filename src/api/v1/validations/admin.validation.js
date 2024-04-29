const joi = require('joi');
const { fieldOfActivity, levelRequirement, acceptanceStatus } = require('../utils/index');
const mongoose = require('mongoose');
const xss = require('xss');

class AdminValidation {

    static validateGetListRecruiter = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const cleanName = xss(value); 
                return cleanName;
            }),
            acceptanceStatus: joi.string().valid(...acceptanceStatus),
            page: joi.number().min(1),
            limit: joi.number().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateApproveRecruiter = data => {
        const validateSchema = joi.object({
            recruiterId: objectIdJoiSchema.required(),
            acceptanceStatus: joi.string().valid(...["accept", "decline"]).required(),
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateRecruiterId = data => {
        const validateSchema = joi.object({
            recruiterId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateGetListJob = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const cleanName = xss(value); // Loại bỏ XSS
                return cleanName;
            }),
            field: joi.string().valid(...fieldOfActivity),
            levelRequirement: joi.string().valid(...levelRequirement),
            acceptanceStatus: joi.string().valid(...acceptanceStatus),
            page: joi.number().min(1),
            limit: joi.number().min(1)
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

    static validateApproveJob = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            acceptanceStatus: joi.string().valid(...["accept", "decline"])
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
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


module.exports = AdminValidation
