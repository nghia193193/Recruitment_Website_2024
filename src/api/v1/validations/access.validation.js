const joi = require('joi');
const xss = require('xss');
const { provinceOfVietNam, jobType, levelRequirement, experience, fieldOfActivity, genderRequirement } = require('../utils');
const mongoose = require('mongoose');

class AccessValidation {

    static validateLogin = data => {
        const validateSchema = joi.object({
            email: joi.string().email().lowercase().required(),
            password: joi.string().min(8).max(32).custom((value) => {
                const cleanPass = xss(value.trim());
                return cleanPass;
            }).required()
        })
        return validateSchema.validate(data);
    }

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

    static validateJobId = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateGetListRecruiter = data => {
        const validateSchema = joi.object({
            searchText: joi.string().custom((value) => {
                const searchText = xss(value.trim());
                return searchText;
            }),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateGetRecruiterInformationBySlug = data => {
        const validateSchema = joi.object({
            slug: joi.string().custom((value) => {
                const slug = xss(value.trim());
                return slug;
            })
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

module.exports = AccessValidation