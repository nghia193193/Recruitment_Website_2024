const joi = require('joi');

class AccessValidation {

    static loginValidate = data => {
        const loginSchema = joi.object({
            email: joi.string().email().lowercase().required(),
            password: joi.string().min(8).max(32).required()
        })
        return loginSchema.validate(data);
    }
}

module.exports = AccessValidation