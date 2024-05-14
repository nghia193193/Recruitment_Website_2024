const joi = require('joi');
const mongoose = require('mongoose');
const xss = require('xss');
const { workStatus, jobType } = require('../utils');

class CandidateValidation {
    static validateUpdateInformation = data => {
        const validateSchema = joi.object({
            name: joi.string().max(50).custom((value) => {
                const cleanName = xss(value);
                return cleanName;
            }),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/)
                .messages({
                    'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
                }),
            gender: joi.string().valid(...["Nam", "Nữ"]),
            homeTown: joi.string().custom((value) => {
                const cleanHomeTown = xss(value);
                return cleanHomeTown;
            }),
            workStatus: joi.string().valid(...workStatus),
            dateOfBirth: joi.date().iso()
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
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

    static validatePageLimit = data => {
        const validateSchema = joi.object({
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        })
        return validateSchema.validate(data);
    }

    static validateJobId = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateRemoveFavoriteJob = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        })
        return validateSchema.validate(data);
    }

    static validateAddResume = data => {
        console.log(data)
        const validateSchema = joi.object({
            name: joi.string().max(50).custom((value) => {
                const cleanName = xss(value);
                return cleanName;
            }).required(),
            title: joi.string().custom((value) => {
                const cleanTitle = xss(value);
                return cleanTitle;
            }).required(),
            avatar: joi.alternatives().try(
                joi.object({
                    mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg'),
                }).unknown(true),
                joi.string().uri()
            ).required(),
            goal: joi.string().custom((value) => {
                const cleanGoal = xss(value);
                return cleanGoal;
            }).required(),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required()
                .messages({
                    'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
                }),
            educationLevel: joi.string().custom((value) => {
                const cleanEL = xss(value);
                return cleanEL;
            }).required(),
            homeTown: joi.string().custom((value) => {
                const cleanHomeTown = xss(value);
                return cleanHomeTown;
            }).required(),
            dateOfBirth: joi.date().iso().required(),
            english: joi.string().custom((value) => {
                const cleanEnglish = xss(value);
                return cleanEnglish;
            }),
            jobType: joi.string().valid(...jobType).required(),
            experience: joi.string().custom((value) => {
                const cleanExperience = xss(value);
                return cleanExperience;
            }),
            GPA: joi.number().required(),
            activity: joi.string().custom((value) => {
                const cleanExperience = xss(value);
                return cleanExperience;
            }),
            certifications: joi.array().items(certificationSchema),
            educations: joi.array().items(educationSchema).required(),
            workHistories: joi.array().items(workHistorySchema)
        }).messages({
            "any.only": "'{#label}' không hợp lệ",
        });
        if (data.certifications) {
            if (typeof(data.certifications) === "string") {
                data.certifications = JSON.parse(data.certifications);
            }
        }
        if (data.educations) {
            if (typeof(data.educations) === "string") {
                data.educations = JSON.parse(data.educations);
            }
        }
        if (data.workHistories) {
            if (typeof(data.workHistories) === "string") {
                data.workHistories = JSON.parse(data.workHistories);
            }
        }
        return validateSchema.validate(data);
    }

    static validateChangePassword = data => {
        const validateSchema = joi.object({
            currentPassword: joi.string().min(8).max(32).custom((value) => {
                const cleanPass = xss(value);
                return cleanPass;
            }).required(),
            newPassword: joi.string().min(8).max(32).custom((value) => {
                const cleanPass = xss(value);
                return cleanPass;
            }).required(),
            confirmNewPassword: joi.string().valid(joi.ref("newPassword")).required().messages({
                'any.only': 'Mật khẩu xác nhận không khớp',
                'any.required': 'Vui lòng nhập mật khẩu xác nhận'
            })
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

const certificationSchema = joi.object({
    name: joi.string().required(), 
    uploadLink: joi.string().uri().required()
});

const educationSchema = joi.object({
    from: joi.date().iso().required(),
    to: joi.date().iso().required(),
    major: joi.string().custom((value) => { // chuyên ngành
        const cleanMajor = xss(value);
        return cleanMajor;
    }).required(), 
});

const workHistorySchema = joi.object({
    from: joi.date().iso().required(),
    to: joi.date().iso().required(),
    workUnit: joi.string().custom((value) => { // đơn vị công tác
        const cleanWorkUnit = xss(value);
        return cleanWorkUnit;
    }).required(), 
    description: joi.string().custom((value) => { // mô tả
        const cleanDescription = xss(value);
        return cleanDescription;
    }).required(), 
});

module.exports = CandidateValidation;