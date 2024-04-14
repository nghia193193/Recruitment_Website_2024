const joi = require('joi');
const { fieldOfActivity } = require('../utils/index');
const Joi = require('joi');

class RecruiterValidation {

    static RecruiterValidate = data => {
        const recruiterSchema = joi.object({
            companyName: joi.string().max(150).required(),
            name: joi.string().max(50).required(),
            email: joi.string().email().lowercase().required(),
            position: joi.string().max(100).required(),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required(),
            contactEmail: joi.string().email().lowercase().required(),
            password: joi.string().min(8).max(32).required(),
            confirmPassword: joi.ref("password")
        })
        return recruiterSchema.validate(data);
    }

    static updateInformation = data => {
        const updateInfSchema = joi.object({
            name: joi.string().max(50),
            position: joi.string().max(100),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/),
            contactEmail: joi.string().email().lowercase(),
            companyName: joi.string().max(150),
            companyEmail: joi.string().email().lowercase(),
            companyPhone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/),
            companyWebsite: joi.string().max(100),
            companyAddress: joi.string().max(200),
            companyLogo: joi.string().max(200),
            companyCoverPhoto: joi.string().max(200),
            about: joi.string().max(1000),
            employeeNumber: joi.number().min(1),
            fieldOfActivity: joi.array().items(Joi.string().valid(...fieldOfActivity))
        })
        return updateInfSchema.validate(data);
    }
}

module.exports = RecruiterValidation
