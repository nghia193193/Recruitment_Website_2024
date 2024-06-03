const joi = require('joi');
const xss = require('xss');
const mongoose = require('mongoose');
const { majors, jobType } = require('../utils');

class ResumeValidation {
    static validateGetListAdvanced = data => {
        const validateSchema = joi.object({
            title: joi.string().custom((value) => {
                const cleanTitle = xss(value.trim());
                return cleanTitle;
            }),
            educationLevel: joi.string().custom((value) => {
                const cleanEL = xss(value.trim());
                return cleanEL;
            }),
            english: joi.string().custom((value) => {
                const cleanEnglish = xss(value.trim());
                return cleanEnglish;
            }),
            jobType: joi.string().valid(...jobType),
            experience: joi.string().custom((value) => {
                const cleanExperience = xss(value.trim());
                return cleanExperience;
            }),
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