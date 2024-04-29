const joi = require('joi');
const xss = require('xss');
const { provinceOfVietNam, jobType, levelRequirement, experience, fieldOfActivity, genderRequirement } = require('../utils');

class AccessValidation {

    static validateLogin = data => {
        const validateSchema = joi.object({
            email: joi.string().email().lowercase().required(),
            password: joi.string().min(8).max(32).custom((value) => {
                const cleanPass = xss(value); // Loại bỏ XSS
                return cleanPass;
            }).required()
        })
        return validateSchema.validate(data);
    }

    static validateGetListJob = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const cleanName = xss(value); // Loại bỏ XSS
                return cleanName;
            }),
            province: joi.string().valid(...provinceOfVietNam),
            type: joi.string().valid(...jobType),
            levelRequirement: joi.string().valid(...levelRequirement),
            experience: joi.string().valid(...experience),
            field: joi.string().valid(...fieldOfActivity),
            genderRequirement: joi.string().valid(...genderRequirement)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }
}

module.exports = AccessValidation