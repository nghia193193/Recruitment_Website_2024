const joi = require('joi');
const { fieldOfActivity, jobType, levelRequirement, experience, genderRequirement, provinceOfVietNam } = require('../utils/index');
const mongoose = require('mongoose');
const xss = require('xss');

class RecruiterValidation {

    static validateSignUp = data => {
        const validateSchema = joi.object({
            companyName: joi.string().max(150).custom((value) => {
                const cleanCN = xss(value);
                return cleanCN;
            }).required(),
            name: joi.string().max(50).custom((value) => {
                const cleanName = xss(value);
                return cleanName;
            }).required(),
            email: joi.string().email().lowercase().required(),
            position: joi.string().custom((value) => {
                const cleanPos = xss(value);
                return cleanPos;
            }).required(),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required()
                .messages({
                    'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
                }),
            contactEmail: joi.string().email().lowercase().required(),
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
                const cleanName = xss(value);
                return cleanName;
            }).required(),
            position: joi.string().max(100).custom((value) => {
                const cleanPos = xss(value);
                return cleanPos;
            }).required(),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).required()
                .messages({
                    'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
                }),
            contactEmail: joi.string().email().lowercase().required(),
            companyName: joi.string().max(150).custom((value) => {
                const cleanCN = xss(value);
                return cleanCN;
            }).required(),
            companyWebsite: joi.string().uri().required(),
            companyAddress: joi.string().max(200).custom((value) => {
                const cleanCA = xss(value);
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
            employeeNumber: joi.number().integer().min(1).required(),
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
            name: joi.string().max(50).custom((value, helpers) => {
                const cleanName = xss(value.trim());
                if (cleanName === '') {
                    return helpers.error('any.empty');
                }
                return cleanName;
            }).optional().messages({
                'any.empty': "'name' không được để trống",
                'string.max': "'name' không được vượt quá 50 ký tự"
            }),
            position: joi.string().custom((value, helpers) => {
                const cleanPos = xss(value.trim());
                if (cleanPos === '') {
                    return helpers.error('any.empty');
                }
                return cleanPos;
            }).optional().messages({
                'any.empty': "'position' không được để trống"
            }),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).optional().messages({
                'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
            }),
            contactEmail: joi.string().email().lowercase().optional().messages({
                'string.email': "'contactEmail' phải là một email hợp lệ"
            })
        }).or(
            'name', 
            'position', 
            'phone', 
            'contactEmail'
        ).messages({
            'object.missing': "Phải có ít nhất một trường được cung cấp để cập nhật"
        });
        return validateSchema.validate(data);
    }

    static validateUpdateCompany = data => {
        const validateSchema = joi.object({
            companyName: joi.string().max(150).custom((value, helpers) => {
                const cleanCN = xss(value.trim());
                if (cleanCN === '') {
                    return helpers.error('any.empty');
                }
                return cleanCN;
            }).optional().messages({
                'any.empty': "Tên công ty không được để trống",
                'string.max': "Tên công ty không được vượt quá 150 ký tự"
            }),
            companyWebsite: joi.string().uri().optional().messages({
                'string.uri': "Website phải là một URL hợp lệ"
            }),
            companyAddress: joi.string().max(200).custom((value, helpers) => {
                const cleanCA = xss(value.trim());
                if (cleanCA === '') {
                    return helpers.error('any.empty');
                }
                return cleanCA;
            }).optional().messages({
                'any.empty': "Địa chỉ không được để trống",
                'string.max': "Địa chỉ không được vượt quá 200 ký tự"
            }),
            companyLogo: joi.alternatives().try(
                joi.object({
                    mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg')
                }).unknown(true),
                joi.string().uri() // Cho phép URL hợp lệ
            ).optional().messages({
                'string.uri': "Logo phải là một URL hợp lệ",
                'object.mimetype': "Logo phải là tệp hình ảnh có định dạng hợp lệ"
            }),
            companyCoverPhoto: joi.alternatives().try(
                joi.object({
                    mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg')
                }).unknown(true),
                joi.string().uri() // Cho phép URL hợp lệ
            ).optional().messages({
                'string.uri': "Ảnh bìa phải là một URL hợp lệ",
                'object.mimetype': "Ảnh bìa phải là tệp hình ảnh có định dạng hợp lệ"
            }),
            about: joi.string().custom((value, helpers) => {
                const cleanAbout = xss(value.trim());
                if (cleanAbout === '') {
                    return helpers.error('any.empty');
                }
                return cleanAbout;
            }).optional().messages({
                'any.empty': "Giới thiệu không được để trống"
            }),
            employeeNumber: joi.number().integer().min(1).optional().messages({
                'number.base': "Số lượng nhân viên phải là số nguyên",
                'number.min': "Số lượng nhân viên phải lớn hơn hoặc bằng 1"
            }),
            fieldOfActivity: joi.array().items(joi.string().valid(...fieldOfActivity)).optional().messages({
                'array.includes': "Lĩnh vực chứa giá trị không hợp lệ"
            }),
            slug: joi.string().custom((value, helpers) => {
                const slug = xss(value.trim());
                if (slug === '') {
                    return helpers.error('any.empty');
                }
                return slug;
            }).optional().messages({
                'any.empty': "Slug không được để trống"
            })
        }).or(
            'companyName',
            'companyWebsite',
            'companyAddress',
            'companyLogo',
            'companyCoverPhoto',
            'about',
            'employeeNumber',
            'fieldOfActivity',
            'slug'
        ).messages({
            'any.only': "'{#label}' không hợp lệ",
            'object.missing': "Phải có ít nhất một trường được cung cấp để cập nhật"
        });
        let processData;
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
        return validateSchema.validate(processData);
    }

    static validateCreateJob = data => {
        const validateSchema = joi.object({
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

    static validateUpdateJob = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            name: joi.string().custom((value, helpers) => {
                const cleanName = xss(value.trim());
                if (cleanName === '') {
                    return helpers.error('any.empty');
                }
                return cleanName;
            }).optional().messages({
                'any.empty': "Tên không được để trống"
            }),
            location: joi.string().custom((value, helpers) => {
                const cleanLocation = xss(value.trim());
                if (cleanLocation === '') {
                    return helpers.error('any.empty');
                }
                return cleanLocation;
            }).optional().messages({
                'any.empty': "Địa điểm công việc không được để trống"
            }),
            province: joi.string().valid(...provinceOfVietNam).optional().messages({
                'any.only': "Tỉnh thành không hợp lệ"
            }),
            type: joi.string().valid(...jobType).optional().messages({
                'any.only': "Loại công việc không hợp lệ"
            }),
            levelRequirement: joi.string().valid(...levelRequirement).optional().messages({
                'any.only': "Vị trí không hợp lệ"
            }),
            experience: joi.string().valid(...experience).optional().messages({
                'any.only': "Kinh nghiệm không hợp lệ"
            }),
            salary: joi.string().custom((value, helpers) => {
                const cleanSalary = xss(value.trim());
                if (cleanSalary === '') {
                    return helpers.error('any.empty');
                }
                return cleanSalary;
            }).optional().messages({
                'any.empty': "Lương không được để trống"
            }),
            field: joi.string().valid(...fieldOfActivity).optional().messages({
                'any.only': "Lĩnh vực không hợp lệ"
            }),
            description: joi.string().custom((value, helpers) => {
                const cleanDescription = xss(value.trim());
                if (cleanDescription === '') {
                    return helpers.error('any.empty');
                }
                return cleanDescription;
            }).optional().messages({
                'any.empty': "Mô tả không được để trống"
            }),
            requirement: joi.string().custom((value, helpers) => {
                const cleanRequirement = xss(value.trim());
                if (cleanRequirement === '') {
                    return helpers.error('any.empty');
                }
                return cleanRequirement;
            }).optional().messages({
                'any.empty': "Yêu cầu công việc không được để trống"
            }),
            benefit: joi.string().custom((value, helpers) => {
                const cleanBenefit = xss(value.trim());
                if (cleanBenefit === '') {
                    return helpers.error('any.empty');
                }
                return cleanBenefit;
            }).optional().messages({
                'any.empty': "Lợi ích không được để trống"
            }),
            quantity: joi.number().integer().min(1).optional().messages({
                'number.base': "Số lượng phải là số nguyên",
                'number.min': "Số lượng phải lớn hơn hoặc bằng 1"
            }),
            deadline: joi.date().iso().optional().messages({
                'date.format': "'deadline' phải là một ngày hợp lệ theo định dạng ISO"
            }),
            genderRequirement: joi.string().valid(...genderRequirement).optional().messages({
                'any.only': "Yêu cầu giới tính không hợp lệ"
            })
        }).or(
            'name', 
            'location', 
            'province', 
            'type', 
            'levelRequirement', 
            'experience', 
            'salary', 
            'field', 
            'description', 
            'requirement', 
            'benefit', 
            'quantity', 
            'deadline', 
            'genderRequirement'
        ).messages({
            'object.missing': "Phải có ít nhất một trường được cung cấp để cập nhật"
        });
        return validateSchema.validate(data);
    }

    static validateChangeJobStatus = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            status: joi.string().valid(...["active", "inactive"]).required(),
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateRecruiterGetListJob = data => {
        const validateSchema = joi.object({
            name: joi.string().custom((value) => {
                const cleanName = xss(value);
                return cleanName;
            }),
            field: joi.string().valid(...fieldOfActivity),
            levelRequirement: joi.string().valid(...levelRequirement),
            status: joi.string().valid(...["active", "inactive"]),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
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

    static validateJobId = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateApplicationId = data => {
        const validateSchema = joi.object({
            applicationId: objectIdJoiSchema.required()
        })
        return validateSchema.validate(data);
    }

    static validateGetListJobApplication = data => {
        const validateSchema = joi.object({
            jobId: objectIdJoiSchema.required(),
            candidateName: joi.string().custom((value) => {
                const cleanName = xss(value.trim());
                return cleanName;
            }),
            experience: joi.string().custom((value) => {
                const cleanExperience = xss(value.trim());
                return cleanExperience;
            }),
            major: joi.string().custom((value) => {
                const cleanMajor = xss(value.trim());
                return cleanMajor;
            }), 
            goal: joi.string().custom((value) => {
                const cleanGoal = xss(value.trim());
                return cleanGoal;
            }),
            status: joi.string().valid('Đã nộp','Đã nhận', 'Không nhận'),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateApproveApplication = data => {
        const validateSchema = joi.object({
            applicationId: objectIdJoiSchema.required(),
            status: joi.string().valid("Đã nhận", "Không nhận").required()
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
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

module.exports = RecruiterValidation
