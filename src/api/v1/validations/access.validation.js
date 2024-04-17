const joi = require('joi');

class AccessValidation {

    static validateLogin = data => {
        const validateSchema = joi.object({
            email: joi.string().email().lowercase().required(),
            password: joi.string().min(8).max(32).required()
        })
        return validateSchema.validate(data);
    }
}

module.exports = AccessValidation