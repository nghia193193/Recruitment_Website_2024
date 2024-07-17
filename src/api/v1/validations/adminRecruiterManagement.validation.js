const joi = require('joi');
const { fieldOfActivity, acceptanceStatus } = require('../utils/index');
const mongoose = require('mongoose');
const xss = require('xss');

class AdminRecruiterManagementValidation {
    static validateGetListRecruiterByAdmin = data => {
        const validateSchema = joi.object({
            searchText: joi.string().custom((value) => {
                const cleanST = xss(value);
                return cleanST;
            }),
            acceptanceStatus: joi.string().valid(...acceptanceStatus),
            field: joi.string().valid(...fieldOfActivity),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateGetListAllRecruiter = data => {
        const validateSchema = joi.object({
            searchText: joi.string().custom((value) => {
                const cleanST = xss(value);
                return cleanST;
            }),
            acceptanceStatus: joi.string().valid(...acceptanceStatus),
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
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg').messages({
                    'any.only': 'Chỉ chấp nhận file JPG, PNG, JPEG.'
                })
            }).unknown(true)).required().messages({
                'array.base': 'Logo không hợp lệ.'
            }),
            companyCoverPhoto: joi.array().items(joi.object({
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg').messages({
                    'any.only': 'Chỉ chấp nhận file JPG, PNG, JPEG.'
                })
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

    static validateUpdateRecruiter = data => {
        const validateSchema = joi.object({
            recruiterId: objectIdJoiSchema.required(),
            name: joi.string().max(50).custom((value, helpers) => {
                const cleanName = xss(value.trim());
                if (cleanName === '') {
                    return helpers.error('any.empty');
                }
                return cleanName;
            }).messages({
                'any.empty': "Tên không được để trống",
                'string.max': "Tên không được vượt quá 50 ký tự"
            }),
            position: joi.string().max(100).custom((value, helpers) => {
                const cleanPos = xss(value.trim());
                if (cleanPos === '') {
                    return helpers.error('any.empty');
                }
                return cleanPos;
            }).messages({
                'any.empty': "Vị trí trong công ty không được để trống",
                'string.max': "Vị trí trong công ty không được vượt quá 50 ký tự"
            }),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/)
                .messages({
                    'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
                }),
            contactEmail: joi.string().email().lowercase(),
            companyName: joi.string().max(150).custom((value, helpers) => {
                const cleanCN = xss(value.trim());
                if (cleanCN === '') {
                    return helpers.error('any.empty');
                }
                return cleanCN;
            }).messages({
                'any.empty': "Tên công ty không được để trống",
            }),
            companyLogo: joi.array().items(joi.object({
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg').messages({
                    'any.only': 'Chỉ chấp nhận file JPG, PNG, JPEG.'
                })
            }).unknown(true)).messages({
                'array.base': 'Logo không hợp lệ.'
            }),
            companyCoverPhoto: joi.array().items(joi.object({
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg').messages({
                    'any.only': 'Chỉ chấp nhận file JPG, PNG, JPEG.'
                })
            }).unknown(true)).messages({
                'array.base': 'Ảnh bìa không hợp lệ.'
            }),
            companyWebsite: joi.string().uri(),
            companyAddress: joi.string().custom((value, helpers) => {
                const cleanCA = xss(value.trim());
                if (cleanCA === '') {
                    return helpers.error('any.empty');
                }
                return cleanCA;
            }).messages({
                'any.empty': "Địa chỉ công ty không được để trống",
            }),
            about: joi.string().custom((value) => {
                const cleanAbout = xss(value.trim());
                return cleanAbout;
            }),
            employeeNumber: joi.number().integer().min(1),
            fieldOfActivity: joi.array().items(joi.string().valid(...fieldOfActivity)),
            slug: joi.string().custom((value, helpers) => {
                const slug = xss(value.trim());
                if (slug === '') {
                    return helpers.error('any.empty');
                }
                return slug;
            }).messages({
                'any.empty': "Địa chỉ công ty không được để trống",
            }),
            acceptanceStatus: joi.string().valid("accept", "decline"),
            reasonDecline: joi.string().custom((value, helpers) => {
                const reason = xss(value.trim());
                if (reason === '') {
                    return helpers.error('any.empty');
                }
                return reason;
            }).messages({
                'any.empty': "Lý do không được để trống",
            }),
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

    static validateGetListBannedRecruiter = data => {
        const validateSchema = joi.object({
            searchText: joi.string().custom((value) => {
                value = xss(value.trim());
                return value;
            }),
            field: joi.string().valid(...fieldOfActivity),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        })
        return validateSchema.validate(data);
    }

    static validateRecruiterId = data => {
        const validateSchema = joi.object({
            recruiterId: objectIdJoiSchema.required()
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

module.exports = AdminRecruiterManagementValidation;