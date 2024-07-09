const joi = require('joi');
const mongoose = require('mongoose');
const { experience, majors, educationLevel, provinceOfVietNam, jobType } = require('../utils');
const xss = require('xss');

class FavoriteResumeValidation {
    static validateGetListFavoriteResume = data => {
        const validateSchema = joi.object({
            title: joi.string().custom((value) => {
                const title = xss(value.trim());
                return title;
            }),
            english: joi.string().custom((value) => {
                const english = xss(value.trim());
                return english;
            }),
            educationLevel: joi.string().valid(...educationLevel),
            homeTown: joi.string().valid(...provinceOfVietNam),
            jobType: joi.string().valid(...jobType),
            experience: joi.string().valid(...experience),
            major: joi.string().valid(...majors),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ",
        });
        return validateSchema.validate(data);
    }

    static validateResumeId = data => {
        const validateSchema = joi.object({
            resumeId: objectIdJoiSchema.required()
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

module.exports = FavoriteResumeValidation;