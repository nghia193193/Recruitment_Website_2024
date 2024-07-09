const joi = require('joi');
const { blogType } = require('../utils/index');
const mongoose = require('mongoose');
const xss = require('xss');

class AdminBlogManagementValidation {
    static validateListBlog = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const name = xss(value.trim());
                return name;
            }),
            type: joi.string().valid(...blogType),
            status: joi.string().valid("active", "inactive"),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateBlogId = data => {
        const validateSchema = joi.object({
            blogId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateCreateBlog = data => {
        const validateSchema = joi.object({
            uploadFile: joi.array().items(joi.object({
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg').messages({
                    'any.only': 'Chỉ chấp nhận file JPG, PNG, JPEG.'
                })
            }).unknown(true)).required().messages({
                'array.base': 'Thumbnail không hợp lệ.'
            }),
            name: joi.string().custom((value, helpers) => {
                const name = xss(value.trim());
                if (name === '') {
                    return helpers.error('any.empty');
                }
                return name;
            }).required().messages({
                'any.empty': "Tên không được để trống",
            }),
            type: joi.string().valid(...blogType).required(),
            content: joi.string().custom((value, helpers) => {
                const content = xss(value.trim());
                if (content === '') {
                    return helpers.error('any.empty');
                }
                return content;
            }).required().messages({
                'any.empty': "Nội dung không được để trống",
            })
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateUpdateBlog = data => {
        const validateSchema = joi.object({
            blogId: objectIdJoiSchema.required(),
            uploadFile: joi.array().items(joi.object({
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg').messages({
                    'any.only': 'Chỉ chấp nhận file JPG, PNG, JPEG.'
                })
            }).unknown(true)).messages({
                'array.base': 'Thumbnail không hợp lệ.'
            }),
            name: joi.string().custom((value, helpers) => {
                const name = xss(value.trim());
                if (name === '') {
                    return helpers.error('any.empty');
                }
                return name;
            }).messages({
                'any.empty': "Tên không được để trống",
            }),
            type: joi.string().valid(...blogType),
            content: joi.string().custom((value, helpers) => {
                const content = xss(value.trim());
                if (content === '') {
                    return helpers.error('any.empty');
                }
                return content;
            }).messages({
                'any.empty': "Nội dung không được để trống",
            }),
            status: joi.string().valid("active", "inactive")
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

module.exports = AdminBlogManagementValidation;