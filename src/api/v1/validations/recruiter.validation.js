const joi = require('joi');
const { fieldOfActivity } = require('../utils/index');
const Joi = require('joi');

class RecruiterValidation {

    static validateSignUp = data => {
        const validateSchema = joi.object({
            companyName: joi.string().max(150).required(),
            name: joi.string().max(50).required(),
            email: joi.string().email().lowercase().required(),
            position: joi.string().max(100).required(),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required(),
            contactEmail: joi.string().email().lowercase().required(),
            password: joi.string().min(8).max(32).required(),
            confirmPassword: joi.ref("password")
        })
        return validateSchema.validate(data);
    }

    static validateUpdateInformation = data => {
        const validateSchema = joi.object({
            name: joi.string().max(50).required(),
            position: joi.string().max(100).required(),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required(),
            contactEmail: joi.string().email().lowercase().required(),
            companyName: joi.string().max(150).required(),
            companyWebsite: joi.string().max(100).required(),
            companyAddress: joi.string().max(200).required(),
            about: joi.string().max(1000),
            employeeNumber: joi.number().min(1).required().required(),
            fieldOfActivity: joi.array().items(Joi.string().valid(...fieldOfActivity)).required()
        }).messages({
            "any.only": "'{#label}' không hợp lệ",
        });
        const processedData = {
            ...data,
            fieldOfActivity: data.fieldOfActivity.split(',').map(item => item.trim())
        }
        return validateSchema.validate(processedData);
    }

    static validateUpdateFiles = data => {
        const validateSchema = joi.object({
            companyLogo: joi.object({
                mimetype: Joi.string().valid('image/jpg', 'image/png', 'image/jpeg'),
            }).unknown(true),
            companyCoverPhoto: joi.object({
                mimetype: Joi.string().valid('image/jpg', 'image/png', 'image/jpeg'),
            }).unknown(true)
        })
        return validateSchema.validate(data);
    }
}

module.exports = RecruiterValidation
