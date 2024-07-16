const joi = require('joi');
const xss = require('xss');
const mongoose = require('mongoose');
const { provinceOfVietNam, jobType, levelRequirement, experience, fieldOfActivity, genderRequirement } = require('../utils');

class JobValidation {
    static validateGetListJob = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const cleanName = xss(value.trim());
                return cleanName;
            }),
            province: joi.string().valid(...provinceOfVietNam),
            type: joi.string().valid(...jobType),
            levelRequirement: joi.string().valid(...levelRequirement),
            experience: joi.string().valid(...experience),
            field: joi.string().valid(...fieldOfActivity),
            genderRequirement: joi.string().valid(...genderRequirement),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateGetListJobPremiumPrivilege = data => {
        const validateSchema = joi.object({
            isBan: joi.boolean(),
            companyName: joi.string().custom((value) => {
                const companyName = xss(value);
                return companyName;
            }),
            name: joi.string().custom((value) => {
                const cleanName = xss(value);
                return cleanName;
            }),
            field: joi.string().valid(...fieldOfActivity),
            levelRequirement: joi.string().valid(...levelRequirement),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateGetListJobPremiumPrivilegeHome = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const cleanName = xss(value.trim());
                return cleanName;
            }),
            province: joi.string().valid(...provinceOfVietNam),
            type: joi.string().valid(...jobType),
            levelRequirement: joi.string().valid(...levelRequirement),
            experience: joi.string().valid(...experience),
            field: joi.string().valid(...fieldOfActivity),
            genderRequirement: joi.string().valid(...genderRequirement),
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

    static validateGetListRelatedJobByField = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            name: joi.string().custom((value) => {
                const cleanName = xss(value.trim());
                return cleanName;
            }),
            province: joi.string().valid(...provinceOfVietNam),
            type: joi.string().valid(...jobType),
            levelRequirement: joi.string().valid(...levelRequirement),
            experience: joi.string().valid(...experience),
            genderRequirement: joi.string().valid(...genderRequirement),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateGetListJobOfRecruiter = data => {
        const validateSchema = joi.object({
            slug: joi.string().custom((value) => {
                const slug = xss(value.trim());
                return slug;
            }),
            name: joi.string().custom((value) => {
                const cleanName = xss(value.trim());
                return cleanName;
            }),
            province: joi.string().valid(...provinceOfVietNam),
            type: joi.string().valid(...jobType),
            levelRequirement: joi.string().valid(...levelRequirement),
            experience: joi.string().valid(...experience),
            field: joi.string().valid(...fieldOfActivity),
            genderRequirement: joi.string().valid(...genderRequirement),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
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

module.exports = JobValidation;