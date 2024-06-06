const joi = require('joi');
const mongoose = require('mongoose');
const { blogType } = require('../utils');
const xss = require('xss');

class BlogValidation {
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
}

const objectIdValidator = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
};
const objectIdJoiSchema = joi.string().custom(objectIdValidator, 'Custom validation for ObjectId').message("Id không hợp lệ");

module.exports = BlogValidation;