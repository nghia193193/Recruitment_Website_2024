const joi = require('joi');
const xss = require('xss');
const mongoose = require('mongoose');
const { majors, jobType, educationLevel, experience } = require('../utils');

class ResumeValidation {
    static validateGetListAdvanced = data => {
        const validateSchema = joi.object({
            searchText: joi.string().custom((value) => {
                const cleanText = xss(value.trim());
                return cleanText;
            }),
            educationLevel: joi.string().valid(...educationLevel),
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
}

module.exports = ResumeValidation;