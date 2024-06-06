const joi = require('joi');
const { fieldOfActivity, jobType, levelRequirement, experience, genderRequirement, provinceOfVietNam, acceptanceStatus } = require('../utils/index');
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

    static validateUpdateInformation = data => {
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
                'array.base': 'Ảnh diện không hợp lệ.'
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

    static validateUpdateAvatar = data => {
        const validateSchema = joi.object({
            avatar: joi.array().items(joi.object({
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg')
            }).unknown(true)).required(),
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
            }).messages({
                'any.empty': "Tên không được để trống",
                'string.max': "Tên không được vượt quá 50 ký tự"
            }),
            position: joi.string().custom((value, helpers) => {
                const cleanPos = xss(value.trim());
                if (cleanPos === '') {
                    return helpers.error('any.empty');
                }
                return cleanPos;
            }).messages({
                'any.empty': "Vị trí không được để trống"
            }),
            phone: joi.string().regex(/^(0[2-9]|1[0-9]|2[0-8]|3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5])[0-9]{8}$/).messages({
                'string.pattern.base': 'Không phải là số điện thoại Việt Nam hợp lệ'
            }),
            contactEmail: joi.string().email().lowercase().messages({
                'string.email': "Email liên hệ phải là một email hợp lệ"
            })
        })
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
            }).messages({
                'any.empty': "Tên công ty không được để trống",
                'string.max': "Tên công ty không được vượt quá 150 ký tự"
            }),
            companyWebsite: joi.string().uri().messages({
                'string.uri': "Website phải là một URL hợp lệ"
            }),
            companyAddress: joi.string().custom((value, helpers) => {
                const cleanCA = xss(value.trim());
                if (cleanCA === '') {
                    return helpers.error('any.empty');
                }
                return cleanCA;
            }).messages({
                'any.empty': "Địa chỉ không được để trống",
                'string.max': "Địa chỉ không được vượt quá 200 ký tự"
            }),
            companyLogo: joi.array().items(joi.object({
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg')
            }).unknown(true)).messages({
                'array.base': 'Logo không hợp lệ.'
            }),
            companyCoverPhoto: joi.array().items(joi.object({
                mimetype: joi.string().valid('image/jpg', 'image/png', 'image/jpeg')
            }).unknown(true)).messages({
                'array.base': 'Ảnh bìa không hợp lệ.'
            }),
            about: joi.string().custom((value, helpers) => {
                const cleanAbout = xss(value.trim());
                if (cleanAbout === '') {
                    return helpers.error('any.empty');
                }
                return cleanAbout;
            }).messages({
                'any.empty': "Giới thiệu không được để trống"
            }),
            employeeNumber: joi.number().integer().min(1).messages({
                'number.base': "Số lượng nhân viên phải là số nguyên",
                'number.min': "Số lượng nhân viên phải lớn hơn hoặc bằng 1"
            }),
            fieldOfActivity: joi.array().items(joi.string().valid(...fieldOfActivity)).messages({
                'array.includes': "Lĩnh vực chứa giá trị không hợp lệ"
            }),
            slug: joi.string().custom((value, helpers) => {
                const slug = xss(value.trim());
                if (slug === '') {
                    return helpers.error('any.empty');
                }
                return slug;
            }).messages({
                'any.empty': "Slug không được để trống"
            })
        }).messages({
            'any.only': "'{#label}' không hợp lệ"
        });
        if (data?.fieldOfActivity) {
            if (typeof (data.fieldOfActivity) === "string") {
                data.fieldOfActivity = JSON.parse(data.fieldOfActivity);
            }
        }
        return validateSchema.validate(data);
    }

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

    static validateGetListRecruiterHomePage = data => {
        const validateSchema = joi.object({
            searchText: joi.string().custom((value) => {
                const searchText = xss(value.trim());
                return searchText;
            }),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateGetRecruiterInformationBySlug = data => {
        const validateSchema = joi.object({
            slug: joi.string().custom((value) => {
                const slug = xss(value.trim());
                return slug;
            })
        })
        return validateSchema.validate(data);
    }

    static validateGetListRelatedRecruiter = data => {
        const validateSchema = joi.object({
            recruiterId: objectIdJoiSchema.required(),
            searchText: joi.string().custom((value) => {
                const searchText = xss(value.trim());
                return searchText;
            }),
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1)
        }).messages({
            "any.only": "'{#label}' không hợp lệ"
        })
        return validateSchema.validate(data);
    }

    static validateCreateJob = data => {
        const validateSchema = joi.object({
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
            quantity: joi.number().integer().min(1).required().messages({
                'number.base': "Số lượng phải là số nguyên",
                'number.min': "Số lượng phải lớn hơn hoặc bằng 1"
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
                'any.empty': "Tên không được để trống"
            }),
            location: joi.string().custom((value, helpers) => {
                const cleanLocation = xss(value.trim());
                if (cleanLocation === '') {
                    return helpers.error('any.empty');
                }
                return cleanLocation;
            }).messages({
                'any.empty': "Địa điểm công việc không được để trống"
            }),
            province: joi.string().valid(...provinceOfVietNam).messages({
                'any.only': "Tỉnh thành không hợp lệ"
            }),
            type: joi.string().valid(...jobType).messages({
                'any.only': "Loại công việc không hợp lệ"
            }),
            levelRequirement: joi.string().valid(...levelRequirement).messages({
                'any.only': "Vị trí không hợp lệ"
            }),
            experience: joi.string().valid(...experience).messages({
                'any.only': "Kinh nghiệm không hợp lệ"
            }),
            salary: joi.string().custom((value, helpers) => {
                const cleanSalary = xss(value.trim());
                if (cleanSalary === '') {
                    return helpers.error('any.empty');
                }
                return cleanSalary;
            }).messages({
                'any.empty': "Lương không được để trống"
            }),
            field: joi.string().valid(...fieldOfActivity).messages({
                'any.only': "Lĩnh vực không hợp lệ"
            }),
            description: joi.string().custom((value, helpers) => {
                const cleanDescription = xss(value.trim());
                if (cleanDescription === '') {
                    return helpers.error('any.empty');
                }
                return cleanDescription;
            }).messages({
                'any.empty': "Mô tả không được để trống"
            }),
            requirement: joi.string().custom((value, helpers) => {
                const cleanRequirement = xss(value.trim());
                if (cleanRequirement === '') {
                    return helpers.error('any.empty');
                }
                return cleanRequirement;
            }).messages({
                'any.empty': "Yêu cầu công việc không được để trống"
            }),
            benefit: joi.string().custom((value, helpers) => {
                const cleanBenefit = xss(value.trim());
                if (cleanBenefit === '') {
                    return helpers.error('any.empty');
                }
                return cleanBenefit;
            }).messages({
                'any.empty': "Lợi ích không được để trống"
            }),
            quantity: joi.number().integer().min(1).messages({
                'number.base': "Số lượng phải là số nguyên",
                'number.min': "Số lượng phải lớn hơn hoặc bằng 1"
            }),
            deadline: joi.date().iso().messages({
                'date.format': "'deadline' phải là một ngày hợp lệ theo định dạng ISO"
            }),
            genderRequirement: joi.string().valid(...genderRequirement).messages({
                'any.only': "Yêu cầu giới tính không hợp lệ"
            })
        })
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

    static validateApproveApplication = data => {
        const validateSchema = joi.object({
            applicationId: objectIdJoiSchema.required(),
            status: joi.string().valid("Đã nhận", "Không nhận").required(),
            reasonDecline: joi.string().custom((value) => {
                const cleanRD = xss(value.trim());
                return cleanRD;
            })
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
