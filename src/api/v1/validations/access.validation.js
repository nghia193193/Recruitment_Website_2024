const joi = require('joi');
const xss = require('xss');
const mongoose = require('mongoose');

class AccessValidation {

    static validateLogin = data => {
        const validateSchema = joi.object({
            email: joi.string().email().lowercase().required(),
            password: joi.string().min(8).max(32).custom((value) => {
                const cleanPass = xss(value.trim());
                return cleanPass;
            }).required()
        })
        return validateSchema.validate(data);
    }

    static validateForgetPassword = data => {
        const validateSchema = joi.object({
            email: joi.string().email().lowercase().required()
        })
        return validateSchema.validate(data);
    }

    static validateResetPassword = data => {
        const validateSchema = joi.object({
            email: joi.string().email().lowercase().required(),
            token: joi.string().custom((value) => {
                const cleanToken = xss(value.trim());
                return cleanToken;
            }).required(),
            newPassword: joi.string().min(8).max(32).custom((value) => {
                const cleanPass = xss(value.trim());
                return cleanPass;
            }).required(),
            confirmNewPassword: joi.string().valid(joi.ref("newPassword")).required().messages({
                'any.only': 'Mật khẩu xác nhận không khớp',
                'any.required': 'Vui lòng nhập mật khẩu xác nhận'
            })
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

module.exports = AccessValidation