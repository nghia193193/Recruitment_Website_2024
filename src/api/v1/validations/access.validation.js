const joi = require('joi');
const xss = require('xss');

class AccessValidation {

    static validateLogin = data => {
        const validateSchema = joi.object({
            email: joi.string().email().lowercase().required(),
            password: joi.string().min(8).max(32).custom((value) => {
                const cleanPass = xss(value); // Loại bỏ XSS
                return cleanPass;
            }).required()
        })
        return validateSchema.validate(data);
    }
}

module.exports = AccessValidation