const joi = require('joi');

class RecruiterValidation {

    static recruiterValidate = data => {
        const recruiterSchema = joi.object({
            companyName: joi.string().max(150).required(),
            name: joi.string().max(50).required(),
            position: joi.string().max(100).required(),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required(),
            contactEmail: joi.string().email().lowercase().required(),
            email: joi.string().email().lowercase().required(),
            password: joi.string().min(8).max(32).required(),
            confirmPassword: joi.ref('password')
        })
    
        return recruiterSchema.validate(data);
    }
}

module.exports = RecruiterValidation
