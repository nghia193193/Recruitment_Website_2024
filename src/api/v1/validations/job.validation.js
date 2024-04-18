const joi = require('joi');
const { fieldOfActivity, jobType, levelRequirement, experience, genderRequirement, provinceOfVietNam } = require('../utils/index');
const xss = require('xss');

class JobValidation {

    static validateCreateJob = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const cleanName = xss(value); // Loại bỏ XSS
                return cleanName;
            }).required(),
            location: joi.string().custom((value) => {
                const cleanLocation = xss(value); // Loại bỏ XSS
                return cleanLocation;
            }).required(),
            province: joi.string().valid(...provinceOfVietNam).required(),
            type: joi.string().valid(...jobType).required(),
            levelRequirement: joi.string().valid(...levelRequirement).required(),
            experience: joi.string().valid(...experience).required(),
            salary: joi.string().custom((value) => {
                const cleanSalary = xss(value); // Loại bỏ XSS
                return cleanSalary;
            }).required(),
            field: joi.string().valid(...fieldOfActivity).required(),
            description: joi.string().custom((value) => {
                const cleanDescription = xss(value); // Loại bỏ XSS
                return cleanDescription;
            }).required(),
            requirement: joi.string().custom((value) => {
                const cleanRequirement = xss(value); // Loại bỏ XSS
                return cleanRequirement;
            }).required(),
            benefit: joi.string().custom((value) => {
                const cleanBenefit = xss(value); // Loại bỏ XSS
                return cleanBenefit;
            }).required(),
            quantity: joi.number().min(1).required(),
            deadline: joi.date().iso().required(),
            gender: joi.string().valid(...genderRequirement).required()
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }
}

module.exports = JobValidation
