const joi = require('joi');
const mongoose = require('mongoose');
const xss = require('xss');
const { workStatus, jobType, experience, educationLevel } = require('../utils');

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
            avatar: joi.array().items(joi.object({
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg')
            }).unknown(true)).required(),
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
            uploadFile: joi.array().items(joi.object({
                mimetype: joi.string().valid('application/pdf').messages({
                    'any.only': 'Chỉ cho phép file PDF!',
                })
            }).unknown(true)).required()
        })
        return validateSchema.validate(data);
    }

    static validateDeleteUploadCertification = data => {
        const validateSchema = joi.object({
            uploadFile: joi.string().custom((value) => {
                const cleanvalue = xss(value.trim());
                return cleanvalue;
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

module.exports = CandidateValidation;