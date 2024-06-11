const joi = require('joi');
const { premiumPackage } = require('../utils/index');
const xss = require('xss');

class RecruiterPaymentValidation {
    static validateCreatePayment = data => {
        const validateSchema = joi.object({
            premiumPackage: joi.string().valid(...premiumPackage).required(),
            orderType: joi.string().custom((value, helpers) => {
                const orderType = xss(value.trim());
                if (orderType === '') {
                    return helpers.error('any.empty');
                }
                return orderType;
            }).required().messages({
                'any.empty': "Loại thanh toán không được để trống"
            }),
            language: joi.string().custom((value, helpers) => {
                const language = xss(value.trim());
                if (language === '') {
                    return helpers.error('any.empty');
                }
                return language;
            }).required().messages({
                'any.empty': "Ngôn ngữ không được để trống"
            })
        })
        return validateSchema.validate(data);
    }
}

module.exports = RecruiterPaymentValidation;