const joi = require('joi');
const { fieldOfActivity, levelRequirement, acceptanceStatus, provinceOfVietNam, jobType, experience, genderRequirement } = require('../utils/index');
const mongoose = require('mongoose');
const xss = require('xss');

class AdminValidation {

    static validateGetListRecruiter = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const cleanName = xss(value); 
                return cleanName;
            }),
            acceptanceStatus: joi.string().valid(...acceptanceStatus),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateCreateRecruiter = data => {
        const validateSchema = joi.object({
            name: joi.string().max(50).custom((value, helpers) => {
                const cleanName = xss(value.trim());
                if (cleanName === '') {
                    return helpers.error('any.empty');
                }
                return cleanName;
            }).required().messages({
                'any.empty': "Tên không được để trống",
                'string.max': "Tên không được vượt quá 50 ký tự"
            }),
            position: joi.string().max(100).custom((value, helpers) => {
                const cleanPos = xss(value.trim());
                if (cleanPos === '') {
                    return helpers.error('any.empty');
                }
                return cleanPos;
            }).required().messages({
                'any.empty': "Vị trí trong công ty không được để trống",
                'string.max': "Vị trí trong công ty không được vượt quá 50 ký tự"
            }),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required()
                .messages({
                    'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
                }),
            contactEmail: joi.string().email().lowercase().required(),
            companyName: joi.string().max(150).custom((value, helpers) => {
                const cleanCN = xss(value.trim());
                if (cleanCN === '') {
                    return helpers.error('any.empty');
                }
                return cleanCN;
            }).required().messages({
                'any.empty': "Tên công ty không được để trống",
            }),
            companyLogo: joi.array().items(joi.object({
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg')
            }).unknown(true)).required().messages({
                'array.base': 'Logo không hợp lệ.'
            }),
            companyCoverPhoto: joi.array().items(joi.object({
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg')
            }).unknown(true)).required().messages({
                'array.base': 'Ảnh bìa không hợp lệ.'
            }),
            companyWebsite: joi.string().uri().required(),
            companyAddress: joi.string().custom((value, helpers) => {
                const cleanCA = xss(value.trim());
                if (cleanCA === '') {
                    return helpers.error('any.empty');
                }
                return cleanCA;
            }).required().messages({
                'any.empty': "Địa chỉ công ty không được để trống",
            }),
            about: joi.string().custom((value) => {
                const cleanAbout = xss(value.trim());
                return cleanAbout;
            }),
            employeeNumber: joi.number().integer().min(1).required(),
            fieldOfActivity: joi.array().items(joi.string().valid(...fieldOfActivity)).required(),
            slug: joi.string().custom((value, helpers) => {
                const slug = xss(value.trim());
                if (slug === '') {
                    return helpers.error('any.empty');
                }
                return slug;
            }).required().messages({
                'any.empty': "Địa chỉ công ty không được để trống",
            }),
            email: joi.string().email().lowercase().required(),
            password: joi.string().min(8).max(32).custom((value) => {
                const cleanPassword = xss(value);
                return cleanPassword;
            }).required()
        }).messages({
            "any.only": "'{#label}' không hợp lệ",
        });
        if (data?.fieldOfActivity) {
            if (typeof (data.fieldOfActivity) === "string") {
                data.fieldOfActivity = JSON.parse(data.fieldOfActivity);
            }
        }
        return validateSchema.validate(data);
    }

    static validateApproveRecruiter = data => {
        const validateSchema = joi.object({
            recruiterId: objectIdJoiSchema.required(),
            acceptanceStatus: joi.string().valid(...["accept", "decline"]).required(),
            reasonDecline: joi.string().custom((value) => {
                const cleanRD = xss(value.trim());
                return cleanRD;
            })
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateRecruiterId = data => {
        const validateSchema = joi.object({
            recruiterId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateJobId = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateCreateJob = data => {
        const validateSchema = joi.object({
            recruiterId: objectIdJoiSchema.required(),
            name: joi.string().custom((value) => {
                const cleanName = xss(value);
                return cleanName;
            }).required(),
            location: joi.string().custom((value) => {
                const cleanLocation = xss(value);
                return cleanLocation;
            }).required(),
            province: joi.string().valid(...provinceOfVietNam).required(),
            type: joi.string().valid(...jobType).required(),
            levelRequirement: joi.string().valid(...levelRequirement).required(),
            experience: joi.string().valid(...experience).required(),
            salary: joi.string().custom((value) => {
                const cleanSalary = xss(value);
                return cleanSalary;
            }).required(),
            field: joi.string().valid(...fieldOfActivity).required(),
            description: joi.string().custom((value) => {
                const cleanDescription = xss(value);
                return cleanDescription;
            }).required(),
            requirement: joi.string().custom((value) => {
                const cleanRequirement = xss(value);
                return cleanRequirement;
            }).required(),
            benefit: joi.string().custom((value) => {
                const cleanBenefit = xss(value);
                return cleanBenefit;
            }).required(),
            quantity: joi.number().integer().min(1).required(),
            deadline: joi.date().iso().required(),
            genderRequirement: joi.string().valid(...genderRequirement).required()
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateApproveJob = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            acceptanceStatus: joi.string().valid(...["accept", "decline"]).required(),
            reasonDecline: joi.string().custom((value) => {
                const cleanRD = xss(value.trim());
                return cleanRD;
            })
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
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


module.exports = AdminValidation
