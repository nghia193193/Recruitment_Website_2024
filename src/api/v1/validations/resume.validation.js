const joi = require('joi');
const xss = require('xss');
const mongoose = require('mongoose');
const { majors, jobType, educationLevel, experience, provinceOfVietNam } = require('../utils');

class ResumeValidation {
    static validateGetListResume = data => {
        const validateSchema = joi.object({
            title: joi.string().custom((value) => {
                const cleanTitle = xss(value.trim());
                return cleanTitle;
            }),
            status: joi.string().valid("active", "inactive"),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ",
        });
        return validateSchema.validate(data);
    }

    static validateResumeId = data => {
        const validateSchema = joi.object({
            resumeId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateAddResume = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const cleanName = xss(value.trim());
                return cleanName;
            }).required(),
            title: joi.string().custom((value) => {
                const cleanTitle = xss(value.trim());
                return cleanTitle;
            }).required(),
            avatar: joi.array().items(joi.object({
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg').messages({
                    'any.only': 'Chỉ chấp nhận file JPG, PNG, JPEG.'
                })
            }).unknown(true)).required().messages({
                'array.base': 'Ảnh đại diện không hợp lệ.'
            }),
            goal: joi.string().custom((value) => {
                const cleanGoal = xss(value.trim());
                return cleanGoal;
            }).required(),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required()
                .messages({
                    'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
                }),
            educationLevel: joi.string().valid(...educationLevel).required(),
            homeTown: joi.string().valid(...provinceOfVietNam).required(),
            dateOfBirth: joi.date().iso().required(),
            english: joi.string().custom((value) => {
                const cleanEnglish = xss(value.trim());
                return cleanEnglish;
            }),
            jobType: joi.string().valid(...jobType).required(),
            experience: joi.string().valid(...experience),
            GPA: joi.number().required(),
            email: joi.string().email().lowercase().required(),
            major: joi.string().valid(...majors).required(),
            activity: joi.string().custom((value) => {
                const cleanExperience = xss(value.trim());
                return cleanExperience;
            }),
            themeId: joi.string().valid("1", "2", "3").required(),
            certifications: joi.array().items(certificationSchema),
            educations: joi.array().items(educationSchema).min(1).required().messages({
                'array.min': 'Quá trình học tập không được để trống.'
            }),
            workHistories: joi.array().items(workHistorySchema)
        }).messages({
            "any.only": "'{#label}' không hợp lệ",
        });
        if (data?.certifications) {
            if (typeof (data.certifications) === "string") {
                data.certifications = JSON.parse(data.certifications);
            }
        }
        if (data?.educations) {
            if (typeof (data.educations) === "string") {
                data.educations = JSON.parse(data.educations);
            }
        }
        if (data?.workHistories) {
            if (typeof (data.workHistories) === "string") {
                data.workHistories = JSON.parse(data.workHistories);
            }
        }
        return validateSchema.validate(data);
    }

    static validateUpdateResume = data => {
        const validateSchema = joi.object({
            resumeId: objectIdJoiSchema.required(),
            name: joi.string().custom((value, helpers) => {
                const cleanName = xss(value.trim());
                if (cleanName === '') {
                    return helpers.error('any.empty');
                }
                return cleanName;
            }).messages({
                'any.empty': "Tên không được để trống"
            }),
            title: joi.string().custom((value, helpers) => {
                const cleanTitle = xss(value.trim());
                if (cleanTitle === '') {
                    return helpers.error('any.empty');
                }
                return cleanTitle;
            }).messages({
                'any.empty': "Tiêu đề không được để trống"
            }),
            avatar: joi.array().items(joi.object({
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg').messages({
                    'any.only': 'Chỉ chấp nhận file JPG, PNG, JPEG.'
                })
            }).unknown(true)).messages({
                'array.base': 'Ảnh đại diện không hợp lệ.'
            }),
            goal: joi.string().custom((value, helpers) => {
                const cleanGoal = xss(value.trim());
                if (cleanGoal === '') {
                    return helpers.error('any.empty');
                }
                return cleanGoal;
            }).messages({
                'any.empty': "Mục tiêu không được để trống"
            }),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).messages({
                'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
            }),
            educationLevel: joi.string().valid(...educationLevel),
            homeTown: joi.string().valid(...provinceOfVietNam),
            dateOfBirth: joi.date().iso().messages({
                'date.format': "Ngày sinh phải là một ngày hợp lệ theo định dạng ISO"
            }),
            english: joi.string().custom((value, helpers) => {
                const cleanEnglish = xss(value.trim());
                return cleanEnglish;
            }),
            jobType: joi.string().valid(...jobType).messages({
                'any.only': "Loại hình công việc không hợp lệ"
            }),
            experience: joi.string().valid(...experience),
            GPA: joi.number().messages({
                'number.base': "'GPA' phải là một số"
            }),
            email: joi.string().email().lowercase(),
            major: joi.string().valid(...majors),
            activity: joi.string().custom((value, helpers) => {
                const cleanActivity = xss(value.trim());
                return cleanActivity;
            }),
            themeId: joi.string().valid("1", "2", "3"),
            certifications: joi.array().items(certificationSchema),
            educations: joi.array().items(educationSchema).min(1).messages({
                'array.min': 'Quá trình học tập không được để trống'
            }),
            workHistories: joi.array().items(workHistorySchema)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        });
        if (data?.certifications) {
            if (typeof (data.certifications) === "string") {
                data.certifications = JSON.parse(data.certifications);
            }
        }
        if (data?.educations) {
            if (typeof (data.educations) === "string") {
                data.educations = JSON.parse(data.educations);
            }
        }
        if (data?.workHistories) {
            if (typeof (data.workHistories) === "string") {
                data.workHistories = JSON.parse(data.workHistories);
            }
        }
        console.log(data)
        return validateSchema.validate(data);
    }

    static validateDeleteResume = data => {
        const validateSchema = joi.object({
            resumeId: objectIdJoiSchema.required(),

        })
        return validateSchema.validate(data);
    }

    static validateChangeStatus = data => {
        const validateSchema = joi.object({
            resumeId: objectIdJoiSchema.required(),
            status: joi.string().valid(...['active', 'inactive']).required()
        }).messages({
            "any.only": "'{#label}' không hợp lệ",
        });
        return validateSchema.validate(data);
    }

    static validateGetListAdvanced = data => {
        const validateSchema = joi.object({
            title: joi.string().custom((value) => {
                const title = xss(value.trim());
                return title;
            }),
            english: joi.string().custom((value) => {
                const english = xss(value.trim());
                return english;
            }),
            educationLevel: joi.string().valid(...educationLevel),
            homeTown: joi.string().valid(...provinceOfVietNam),
            jobType: joi.string().valid(...jobType),
            experience: joi.string().valid(...experience),
            major: joi.string().valid(...majors),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ",
        });
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
    uploadFile: joi.string().uri().required().messages({
        'string.base': 'uploadFile phải là một chuỗi!',
        'string.empty': 'uploadFile không được để trống!',
        'string.uri': 'uploadFile phải là một URL hợp lệ!',
        'any.required': 'Trường uploadFile là bắt buộc!'
    })
});

const educationSchema = joi.object({
    from: joi.date().iso().required(),
    to: joi.date().iso().required(),
    major: joi.string().valid(...majors).required(),
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

module.exports = ResumeValidation;