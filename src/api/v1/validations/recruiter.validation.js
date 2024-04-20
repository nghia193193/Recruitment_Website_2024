const joi = require('joi');
const { fieldOfActivity } = require('../utils/index');
const xss = require('xss');

class RecruiterValidation {

    static validateSignUp = data => {
        const validateSchema = joi.object({
            companyName: joi.string().max(150).custom((value) => {
                const cleanCN = xss(value); // Loại bỏ XSS
                return cleanCN;
            }).required(),
            name: joi.string().max(50).custom((value) => {
                const cleanName = xss(value); // Loại bỏ XSS
                console.log(cleanName)
                return cleanName;
            }).required(),
            email: joi.string().email().lowercase().required(),
            position: joi.string().max(100).custom((value) => {
                const cleanPos = xss(value); // Loại bỏ XSS
                return cleanPos;
            }).required(),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required(),
            contactEmail: joi.string().email().lowercase().required(),
            password: joi.string().min(8).max(32).custom((value) => {
                const cleanPassword = xss(value); // Loại bỏ XSS
                return cleanPassword;
            }).required(),
            confirmPassword: joi.ref("password")
        })
        return validateSchema.validate(data);
    }

    static validateUpdateInformation = data => {
        const validateSchema = joi.object({
            name: joi.string().max(50).custom((value) => {
                const cleanName = xss(value); // Loại bỏ XSS
                return cleanName;
            }).required(),
            position: joi.string().max(100).custom((value) => {
                const cleanPos = xss(value); // Loại bỏ XSS
                return cleanPos;
            }).required(),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required(),
            contactEmail: joi.string().email().lowercase().required(),
            companyName: joi.string().max(150).custom((value) => {
                const cleanCN = xss(value); // Loại bỏ XSS
                return cleanCN;
            }).required(),
            companyWebsite: joi.string().uri().required(),
            companyAddress: joi.string().max(200).custom((value) => {
                const cleanCA = xss(value); // Loại bỏ XSS
                return cleanCA;
            }).required(),
            companyLogo: joi.alternatives().try(
                joi.object({
                    mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg'),
                }).unknown(true),
                joi.string().uri() // Cho phép URL hợp lệ
            ),
            companyCoverPhoto: joi.alternatives().try(
                joi.object({
                    mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg'),
                }).unknown(true),
                joi.string().uri() // Cho phép URL hợp lệ
            ),
            about: joi.string().custom((value) => {
                const cleanAbout = xss(value); // Loại bỏ XSS
                return cleanAbout;
            }).max(1000),
            employeeNumber: joi.number().min(1).required().required(),
            fieldOfActivity: joi.array().items(joi.string().valid(...fieldOfActivity)).required()
        }).messages({
            "any.only": "'{#label}' không hợp lệ",
        });
        let fieldOA = data?.fieldOfActivity;
        if (Array.isArray(fieldOA)) {
            fieldOA = fieldOA;
        } else {
            fieldOA = fieldOA.split(',').map(item => item.trim())
        }
        const processData = {
            ...data,
            fieldOfActivity: fieldOA
        }
        return validateSchema.validate(processData);
    }
}

module.exports = RecruiterValidation
