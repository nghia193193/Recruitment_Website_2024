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
}

module.exports = CandidateValidation;