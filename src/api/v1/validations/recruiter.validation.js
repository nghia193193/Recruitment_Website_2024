const joi = require('joi');
const { fieldOfActivity, jobType, levelRequirement, experience, genderRequirement, provinceOfVietNam } = require('../utils/index');
const mongoose = require('mongoose');
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
                return cleanName;
            }).required(),
            email: joi.string().email().lowercase().required(),
            position: joi.string().max(100).custom((value) => {
                const cleanPos = xss(value); // Loại bỏ XSS
                return cleanPos;
            }).required(),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required()
                .messages({
                    'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
                }),
            contactEmail: joi.string().email().lowercase().required(),
            password: joi.string().min(8).max(32).custom((value) => {
                const cleanPassword = xss(value); // Loại bỏ XSS
                return cleanPassword;
            }).required(),
            confirmPassword: joi.string().valid(joi.ref("password")).required().messages({
                'any.only': 'Mật khẩu xác nhận không khớp',
                'any.required': 'Vui lòng nhập mật khẩu xác nhận'
            })
        })
        return validateSchema.validate(data);
    }

    static validateCandidateSignUp = data => {
        const validateSchema = joi.object({
            name: joi.string().max(50).custom((value) => {
                const cleanName = xss(value);
                return cleanName;
            }).required(),
            email: joi.string().email().lowercase().required(),
            password: joi.string().min(8).max(32).custom((value) => {
                const cleanPassword = xss(value);
                return cleanPassword;
            }).required(),
            confirmPassword: joi.string().valid(joi.ref("password")).required().messages({
                'any.only': 'Mật khẩu xác nhận không khớp',
                'any.required': 'Vui lòng nhập mật khẩu xác nhận'
            })
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
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required()
                .messages({
                    'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
                }),
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
            ).required(),
            companyCoverPhoto: joi.alternatives().try(
                joi.object({
                    mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg'),
                }).unknown(true),
                joi.string().uri()
            ).required(),
            about: joi.string().custom((value) => {
                const cleanAbout = xss(value);
                return cleanAbout;
            }),
            employeeNumber: joi.number().min(1).required(),
            fieldOfActivity: joi.array().items(joi.string().valid(...fieldOfActivity)).required(),
            slug: joi.string().custom((value) => {
                const slug = xss(value);
                return slug;
            }).required()
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

    static validateUpdateAvatar = data => {
        const validateSchema = joi.object({
            avatar: joi.alternatives().try(
                joi.object({
                    mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg'),
                }).unknown(true),
                joi.string().uri() // Cho phép URL hợp lệ
            ).required(),
        })
        return validateSchema.validate(data);
    }

    static validateUpdateProfile = data => {
        const validateSchema = joi.object({
            name: joi.string().max(50).custom((value) => {
                const cleanName = xss(value); // Loại bỏ XSS
                return cleanName;
            }),
            position: joi.string().max(100).custom((value) => {
                const cleanPos = xss(value); // Loại bỏ XSS
                return cleanPos;
            }),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/)
                .messages({
                    'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
                }),
            contactEmail: joi.string().email().lowercase()
        })
        return validateSchema.validate(data);
    }

    static validateUpdateCompany = data => {
        const validateSchema = joi.object({
            companyName: joi.string().max(150).custom((value) => {
                const cleanCN = xss(value); // Loại bỏ XSS
                return cleanCN;
            }),
            companyWebsite: joi.string().uri(),
            companyAddress: joi.string().max(200).custom((value) => {
                const cleanCA = xss(value); // Loại bỏ XSS
                return cleanCA;
            }),
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
                const cleanAbout = xss(value);
                return cleanAbout;
            }),
            employeeNumber: joi.number().min(1),
            fieldOfActivity: joi.array().items(joi.string().valid(...fieldOfActivity)),
            slug: joi.string().custom((value) => {
                const slug = xss(value);
                return slug;
            }),
        }).messages({
            "any.only": "'{#label}' không hợp lệ",
        });
        let processData;
        if (data.fieldOfActivity) {
            let fieldOA = data.fieldOfActivity;
            if (Array.isArray(fieldOA)) {
                fieldOA = fieldOA;
            } else {
                fieldOA = fieldOA.split(',').map(item => item.trim())
            }
            processData = {
                ...data,
                fieldOfActivity: fieldOA
            }
        } else {
            processData = data
        }
        return validateSchema.validate(processData);
    }

    static validateCreateJob = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const cleanName = xss(value); // Loại bỏ XSS
                return cleanName;
            }).required(),
            location: joi.string().custom((value) => {
                const cleanLocation = xss(value); // Loại bỏ XSS
                return cleanLocation;
            }).required(),
            province: joi.string().valid(...provinceOfVietNam).required(),
            type: joi.string().valid(...jobType).required(),
            levelRequirement: joi.string().valid(...levelRequirement).required(),
            experience: joi.string().valid(...experience).required(),
            salary: joi.string().custom((value) => {
                const cleanSalary = xss(value); // Loại bỏ XSS
                return cleanSalary;
            }).required(),
            field: joi.string().valid(...fieldOfActivity).required(),
            description: joi.string().custom((value) => {
                const cleanDescription = xss(value); // Loại bỏ XSS
                return cleanDescription;
            }).required(),
            requirement: joi.string().custom((value) => {
                const cleanRequirement = xss(value); // Loại bỏ XSS
                return cleanRequirement;
            }).required(),
            benefit: joi.string().custom((value) => {
                const cleanBenefit = xss(value); // Loại bỏ XSS
                return cleanBenefit;
            }).required(),
            quantity: joi.number().min(1).required(),
            deadline: joi.date().iso().required(),
            genderRequirement: joi.string().valid(...genderRequirement).required()
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateUpdateJob = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            name: joi.string().custom((value) => {
                const cleanName = xss(value); // Loại bỏ XSS
                return cleanName;
            }),
            location: joi.string().custom((value) => {
                const cleanLocation = xss(value); // Loại bỏ XSS
                return cleanLocation;
            }),
            province: joi.string().valid(...provinceOfVietNam),
            type: joi.string().valid(...jobType),
            levelRequirement: joi.string().valid(...levelRequirement),
            experience: joi.string().valid(...experience),
            salary: joi.string().custom((value) => {
                const cleanSalary = xss(value); // Loại bỏ XSS
                return cleanSalary;
            }),
            field: joi.string().valid(...fieldOfActivity),
            description: joi.string().custom((value) => {
                const cleanDescription = xss(value); // Loại bỏ XSS
                return cleanDescription;
            }),
            requirement: joi.string().custom((value) => {
                const cleanRequirement = xss(value); // Loại bỏ XSS
                return cleanRequirement;
            }),
            benefit: joi.string().custom((value) => {
                const cleanBenefit = xss(value); // Loại bỏ XSS
                return cleanBenefit;
            }),
            quantity: joi.number().min(1),
            deadline: joi.date().iso(),
            genderRequirement: joi.string().valid(...genderRequirement)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateChangeJobStatus = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            status: joi.string().valid(...["active", "inactive"]),
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateRecruiterGetListJob = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const cleanName = xss(value); // Loại bỏ XSS
                return cleanName;
            }),
            field: joi.string().valid(...fieldOfActivity),
            levelRequirement: joi.string().valid(...levelRequirement),
            status: joi.string().valid(...["active", "inactive"]),
            page: joi.number().min(1),
            limit: joi.number().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateChangePassword = data => {
        const validateSchema = joi.object({
            currentPassword: joi.string().min(8).max(32).custom((value) => {
                const cleanPass = xss(value); // Loại bỏ XSS
                return cleanPass;
            }).required(),
            newPassword: joi.string().min(8).max(32).custom((value) => {
                const cleanPass = xss(value); // Loại bỏ XSS
                return cleanPass;
            }).required(),
            confirmNewPassword: joi.string().valid(joi.ref("newPassword")).required().messages({
                'any.only': 'Mật khẩu xác nhận không khớp',
                'any.required': 'Vui lòng nhập mật khẩu xác nhận'
            })
        })
        return validateSchema.validate(data);
    }

    static validateJobId = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required()
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

module.exports = RecruiterValidation
