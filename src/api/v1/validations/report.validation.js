const joi = require('joi');
const xss = require('xss');
const mongoose = require('mongoose');

class ReportValidation {
    static validateCreateReport = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            name: joi.string().custom((value, helpers) => {
                value = xss(value.trim());
                if (value === "") {
                    return helpers.error('any.invalid');
                }
                return value;
            }).required().messages({
                "any.invalid": "Họ và tên không được để trống",
            }),
            email: joi.string().email().required(),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required()
                .messages({
                    'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
                }),
            content: joi.string().custom((value, helpers) => { 
                value = xss(value.trim());
                if (value === "") {
                    return helpers.error('any.invalid');
                }
                return value;
            }).required().messages({
                "any.invalid": "Nội dung không được để trống",
            })
        }).messages({
            "any.only": "'{#label}' không hợp lệ",
        });
        return validateSchema.validate(data);
    }

    static validateGetListReportOfJob = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            page: joi.number().min(1),
            limit: joi.number().min(1)
        });
        return validateSchema.validate(data);
    }

    static validateReadReport = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            reportId: objectIdJoiSchema.required()
        });
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

module.exports = ReportValidation;