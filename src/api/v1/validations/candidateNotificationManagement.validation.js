const joi = require('joi');
const mongoose = require('mongoose');

class CandidateNotificationValidation {
    static validateNotificationId = data => {
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

module.exports = CandidateNotificationValidation;