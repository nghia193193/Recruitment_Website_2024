const joi = require('joi');
const { fieldOfActivity } = require('../utils/index');
const Joi = require('joi');
const mongoose = require('mongoose');

class AdminValidation {

    static validateGetListRecruiter = data => {
        const validateSchema = joi.object({
            name: joi.string().max(50),
            status: joi.string().valid("active", "inactive"),
            page: joi.number().min(1),
            limit: joi.number().min(1)
        })
        return validateSchema.validate(data);
    }

    static validateRecruiterStatus = data => {
        const validateSchema = joi.object({
            status: joi.string().valid("active", "inactive").required(),
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
const objectIdJoiSchema = Joi.string().custom(objectIdValidator, 'Custom validation for ObjectId').message("Id không hợp lệ");


module.exports = AdminValidation
