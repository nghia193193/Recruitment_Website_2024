const joi = require('joi');
const { fieldOfActivity, levelRequirement, provinceOfVietNam, jobType, experience, genderRequirement } = require('../utils/index');
const mongoose = require('mongoose');
const xss = require('xss');

class AdminJobManagementValidation {
    static validateJobId = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateCreateJob = data => {
        const validateSchema = joi.object({
            recruiterId: objectIdJoiSchema.required(),
            name: joi.string().custom((value, helpers) => {
                const cleanName = xss(value.trim());
                if (cleanName === '') {
                    return helpers.error('any.empty');
                }
                return cleanName;
            }).required().messages({
                'any.empty': "Tên không được để trống",
            }),
            location: joi.string().custom((value, helpers) => {
                const cleanLocation = xss(value.trim());
                if (cleanLocation === '') {
                    return helpers.error('any.empty');
                }
                return cleanLocation;
            }).required().messages({
                'any.empty': "Địa chỉ không được để trống",
            }),
            province: joi.string().valid(...provinceOfVietNam).required(),
            type: joi.string().valid(...jobType).required(),
            levelRequirement: joi.string().valid(...levelRequirement).required(),
            experience: joi.string().valid(...experience).required(),
            salary: joi.string().custom((value, helpers) => {
                const cleanSalary = xss(value.trim());
                if (cleanSalary === '') {
                    return helpers.error('any.empty');
                }
                return cleanSalary;
            }).required().messages({
                'any.empty': "Mức lương không được để trống",
            }),
            field: joi.string().valid(...fieldOfActivity).required(),
            description: joi.string().custom((value, helpers) => {
                const cleanDescription = xss(value.trim());
                if (cleanDescription === '') {
                    return helpers.error('any.empty');
                }
                return cleanDescription;
            }).required().messages({
                'any.empty': "mô tả công việc không được để trống",
            }),
            requirement: joi.string().custom((value, helpers) => {
                const cleanRequirement = xss(value.trim());
                if (cleanRequirement === '') {
                    return helpers.error('any.empty');
                }
                return cleanRequirement;
            }).required().messages({
                'any.empty': "Yêu cầu công việc không được để trống",
            }),
            benefit: joi.string().custom((value, helpers) => {
                const cleanBenefit = xss(value.trim());
                if (cleanBenefit === '') {
                    return helpers.error('any.empty');
                }
                return cleanBenefit;
            }).required().messages({
                'any.empty': "Lợi ích không được để trống",
            }),
            quantity: joi.alternatives().try(
                joi.string().valid('o').required(),
                joi.number().integer().min(1).required(),
            ).messages({
                'string.valid': "Số lượng không hợp lệ",
                'number.base': "Số lượng không hợp lệ",
                'number.min': "Số lượng phải lớn hơn hoặc bằng 1",
                'alternatives.types': "Số lượng không hợp lệ"
            }),
            deadline: joi.date().iso().required().messages({
                'date.format': "'deadline' phải là một ngày hợp lệ theo định dạng ISO"
            }),
            genderRequirement: joi.string().valid(...genderRequirement).required()
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateUpdateJob = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            name: joi.string().custom((value, helpers) => {
                const cleanName = xss(value.trim());
                if (cleanName === '') {
                    return helpers.error('any.empty');
                }
                return cleanName;
            }).messages({
                'any.empty': "Tên không được để trống",
            }),
            location: joi.string().custom((value, helpers) => {
                const cleanLocation = xss(value.trim());
                if (cleanLocation === '') {
                    return helpers.error('any.empty');
                }
                return cleanLocation;
            }).messages({
                'any.empty': "Địa chỉ không được để trống",
            }),
            province: joi.string().valid(...provinceOfVietNam),
            type: joi.string().valid(...jobType),
            levelRequirement: joi.string().valid(...levelRequirement),
            experience: joi.string().valid(...experience),
            salary: joi.string().custom((value, helpers) => {
                const cleanSalary = xss(value.trim());
                if (cleanSalary === '') {
                    return helpers.error('any.empty');
                }
                return cleanSalary;
            }).messages({
                'any.empty': "Mức lương không được để trống",
            }),
            field: joi.string().valid(...fieldOfActivity),
            description: joi.string().custom((value, helpers) => {
                const cleanDescription = xss(value.trim());
                if (cleanDescription === '') {
                    return helpers.error('any.empty');
                }
                return cleanDescription;
            }).messages({
                'any.empty': "mô tả công việc không được để trống",
            }),
            requirement: joi.string().custom((value, helpers) => {
                const cleanRequirement = xss(value.trim());
                if (cleanRequirement === '') {
                    return helpers.error('any.empty');
                }
                return cleanRequirement;
            }).messages({
                'any.empty': "Yêu cầu công việc không được để trống",
            }),
            benefit: joi.string().custom((value, helpers) => {
                const cleanBenefit = xss(value.trim());
                if (cleanBenefit === '') {
                    return helpers.error('any.empty');
                }
                return cleanBenefit;
            }).messages({
                'any.empty': "Lợi ích không được để trống",
            }),
            quantity: joi.alternatives().try(
                joi.string().valid('o'),
                joi.number().integer().min(1),
            ).messages({
                'string.valid': "Số lượng không hợp lệ",
                'number.base': "Số lượng không hợp lệ",
                'number.min': "Số lượng phải lớn hơn hoặc bằng 1",
                'alternatives.types': "Số lượng không hợp lệ"
            }),
            deadline: joi.date().iso().messages({
                'date.format': "'deadline' phải là một ngày hợp lệ theo định dạng ISO"
            }),
            genderRequirement: joi.string().valid(...genderRequirement),
            acceptanceStatus: joi.string().valid("accept", "decline"),
            reasonDecline: joi.string().custom((value, helpers) => {
                const cleanRD = xss(value.trim());
                if (cleanRD === '') {
                    return helpers.error('any.empty');
                }
                return cleanRD;
            }).messages({
                'any.empty': "Lí do không được để trống",
            })
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateApproveJob = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            acceptanceStatus: joi.string().valid(...["accept", "decline"]).required(),
            reasonDecline: joi.string().custom((value, helpers) => {
                const cleanRD = xss(value.trim());
                if (cleanRD === '') {
                    return helpers.error('any.empty');
                }
                return cleanRD;
            }).messages({
                'any.empty': "Lí do không được để trống",
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

module.exports = AdminJobManagementValidation;