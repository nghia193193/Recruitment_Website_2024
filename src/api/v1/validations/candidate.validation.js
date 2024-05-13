const joi = require('joi');
const mongoose = require('mongoose');
const xss = require('xss');
const { workStatus } = require('../utils');

class CandidateValidation {
    static validateUpdateInformation = data => {
        const validateSchema = joi.object({
            name: joi.string().max(50).custom((value) => {
                const cleanName = xss(value);
                return cleanName;
            }),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/)
                .messages({
                    'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
                }),
            gender: joi.string().valid(...["Nam", "Nữ"]),
            homeTown: joi.string().custom((value) => {
                const cleanHomeTown = xss(value);
                return cleanHomeTown;
            }),
            workStatus: joi.string().valid(...workStatus),
            dateOfBirth: joi.date().iso()
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateUpdateAvatar = data => {
        const validateSchema = joi.object({
            avatar: joi.alternatives().try(
                joi.object({
                    mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg'),
                }).unknown(true),
                joi.string().uri() // Cho phép URL hợp lệ
            ).required(),
        })
        return validateSchema.validate(data);
    }

    static validatePageLimit = data => {
        const validateSchema = joi.object({
            page: joi.number().min(1),
            limit: joi.number().min(1)
        })
        return validateSchema.validate(data);
    }

    static validateJobId = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateRemoveFavoriteJob = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            page: joi.number().min(1),
            limit: joi.number().min(1)
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

module.exports = CandidateValidation;