const joi = require('joi');
const mongoose = require('mongoose');
const xss = require('xss');
const { workStatus, jobType } = require('../utils');

class CandidateValidation {
    static validateSignUp = data => {
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
            name: joi.string().max(50).custom((value, helpers) => {
                const cleanName = xss(value.trim());
                if (cleanName === '') {
                    return helpers.error('any.empty');
                }
                return cleanName;
            }).messages({
                'any.empty': "Tên không được để trống"
            }),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).messages({
                'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
            }),
            gender: joi.string().valid("Nam", "Nữ").messages({
                'any.only': "Giới tính không hợp lệ"
            }),
            homeTown: joi.string().custom((value, helpers) => {
                const cleanHomeTown = xss(value.trim());
                if (cleanHomeTown === '') {
                    return helpers.error('any.empty');
                }
                return cleanHomeTown;
            }).messages({
                'any.empty': "Quê quán không được để trống"
            }),
            workStatus: joi.string().valid(...workStatus).messages({
                'any.only': "Trạng thái công việc không hợp lệ"
            }),
            dateOfBirth: joi.date().iso().messages({
                'date.format': "Ngày sinh phải là một ngày hợp lệ theo định dạng ISO"
            }),
            allowSearch: joi.string().valid("true", "false"),
            listResume: joi.array().items(objectIdJoiSchema)
        })
        if (data?.listResume) {
            if (typeof(data.listResume) === "string") {
                data.listResume = JSON.parse(data.listResume);
            }
        }
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

    static validateGetListFavoriteJob = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const cleanName = xss(value.trim());
                return cleanName;
            }),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        })
        return validateSchema.validate(data);
    }

    static validateGetListFavoriteRecruiter = data => {
        const validateSchema = joi.object({
            searchText: joi.string().custom((value) => {
                const cleanST = xss(value.trim());
                return cleanST;
            }),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        })
        return validateSchema.validate(data);
    }

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

    static validateJobId = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateRecruiterId = data => {
        const validateSchema = joi.object({
            recruiterId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateResumeId = data => {
        const validateSchema = joi.object({
            resumeId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateRemoveFavoriteJob = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            name: joi.string().custom((value) => {
                const cleanName = xss(value.trim());
                return cleanName;
            }),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        })
        return validateSchema.validate(data);
    }

    static validateRemoveFavoriteRecruiter = data => {
        const validateSchema = joi.object({
            recruiterId: objectIdJoiSchema.required(),
            searchText: joi.string().custom((value) => {
                const cleanST = xss(value.trim());
                return cleanST;
            }),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
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
            avatar: joi.alternatives().try(
                joi.object({
                    mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg'),
                }).unknown(true),
                joi.string().uri()
            ).required(),
            goal: joi.string().custom((value) => {
                const cleanGoal = xss(value.trim());
                return cleanGoal;
            }).required(),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required()
                .messages({
                    'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
                }),
            educationLevel: joi.string().custom((value) => {
                const cleanEL = xss(value.trim());
                return cleanEL;
            }).required(),
            homeTown: joi.string().custom((value) => {
                const cleanHomeTown = xss(value.trim());
                return cleanHomeTown;
            }).required(),
            dateOfBirth: joi.date().iso().required(),
            english: joi.string().custom((value) => {
                const cleanEnglish = xss(value.trim());
                return cleanEnglish;
            }),
            jobType: joi.string().valid(...jobType).required(),
            experience: joi.string().custom((value) => {
                const cleanExperience = xss(value.trim());
                return cleanExperience;
            }),
            GPA: joi.number().required(),
            email: joi.string().email().lowercase().required(),
            major: joi.string().custom((value) => {
                const celanMajor = xss(value.trim());
                return celanMajor;
            }).required(),
            activity: joi.string().custom((value) => {
                const cleanExperience = xss(value.trim());
                return cleanExperience;
            }),
            certifications: joi.array().items(certificationSchema),
            educations: joi.array().items(educationSchema).min(1).required().messages({
                'array.min': 'Quá trình học tập không được để trống.'
            }),
            workHistories: joi.array().items(workHistorySchema)
        }).messages({
            "any.only": "'{#label}' không hợp lệ",
        });
        if (data?.certifications) {
            if (typeof(data.certifications) === "string") {
                data.certifications = JSON.parse(data.certifications);
            }
        }
        if (data?.educations) {
            if (typeof(data.educations) === "string") {
                data.educations = JSON.parse(data.educations);
            }
        }
        if (data?.workHistories) {
            if (typeof(data.workHistories) === "string") {
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
            avatar: joi.alternatives().try(
                joi.object({
                    mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg'),
                }).unknown(true),
                joi.string().uri()
            ),
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
            educationLevel: joi.string().custom((value, helpers) => {
                const cleanEL = xss(value.trim());
                if (cleanEL === '') {
                    return helpers.error('any.empty');
                }
                return cleanEL;
            }).messages({
                'any.empty': "Trình độ học vấn không được để trống"
            }),
            homeTown: joi.string().custom((value, helpers) => {
                const cleanHomeTown = xss(value.trim());
                if (cleanHomeTown === '') {
                    return helpers.error('any.empty');
                }
                return cleanHomeTown;
            }).messages({
                'any.empty': "Quê quán không được để trống"
            }),
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
            experience: joi.string().custom((value, helpers) => {
                const cleanExperience = xss(value.trim());
                return cleanExperience;
            }),
            GPA: joi.number().messages({
                'number.base': "'GPA' phải là một số"
            }),
            email: joi.string().email().lowercase(),
            major: joi.string().custom((value) => {
                const celanMajor = xss(value.trim());
                return celanMajor;
            }),
            activity: joi.string().custom((value, helpers) => {
                const cleanActivity = xss(value.trim());
                return cleanActivity;
            }),
            certifications: joi.array().items(certificationSchema),
            educations: joi.array().items(educationSchema).min(1).messages({
                'array.min': 'Quá trình học tập không được để trống'
            }),
            workHistories: joi.array().items(workHistorySchema)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        });
        if (data?.certifications) {
            if (typeof(data.certifications) === "string") {
                data.certifications = JSON.parse(data.certifications);
            }
        }
        if (data?.educations) {
            if (typeof(data.educations) === "string") {
                data.educations = JSON.parse(data.educations);
            }
        }
        if (data?.workHistories) {
            if (typeof(data.workHistories) === "string") {
                data.workHistories = JSON.parse(data.workHistories);
            }
        }
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

    static validateUploadCertification = data => {
        const validateSchema = joi.object({
            uploadFile: joi.object({
                name: joi.string(),
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg', 'application/pdf'),
                size: joi.number().max(5 * 1024 * 1024)
            }).unknown(true).required()
        })
        return validateSchema.validate(data);
    }

    static validateDeleteUploadCertification = data => {
        const validateSchema = joi.object({
            Id: joi.string().custom((value) => {
                const cleanPass = xss(value.trim());
                return cleanPass;
            }).required()
        })
        return validateSchema.validate(data);
    }

    static validateApplyJob = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            resumeId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateGetListApplication = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const cleanName = xss(value.trim());
                return cleanName;
            }),
            status: joi.string().valid('Đã nộp','Đã nhận', 'Không nhận'),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        })
        return validateSchema.validate(data);
    }

    static validateReadNotification = data => {
        const validateSchema = joi.object({
            notificationId: objectIdJoiSchema.required(),
            
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

const uploadFileSchema = joi.object({
    Id: joi.string().custom((value) => {
        const cleanPass = xss(value.trim());
        return cleanPass;
    }).required(), 
    url: joi.string().uri().required()
});

const certificationSchema = joi.object({
    name: joi.string().required(), 
    uploadFile: uploadFileSchema.required()
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