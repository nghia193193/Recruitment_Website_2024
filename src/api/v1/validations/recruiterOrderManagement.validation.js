const joi = require('joi');
const xss = require('xss');

class RecruiterOrderManageMentValidation {
    static validateCancelOrder = data => {
        const validateSchema = joi.object({
            reasonCancel: joi.string().custom((value, helpers) => {
                const reasonCancel = xss(value.trim());
                if (reasonCancel === '') {
                    return helpers.error('any.empty');
                }
                return reasonCancel;
            }).required().messages({
                'any.empty': "Lí do không được để trống"
            })
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }
}

module.exports = RecruiterOrderManageMentValidation;