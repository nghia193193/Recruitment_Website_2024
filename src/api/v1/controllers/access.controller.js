'use strict'

const { BadRequestError } = require('../core/error.response');
const { CREATED, OK } = require('../core/success.response');
const accessService = require('../services/access.service');
const AccessValidation = require('../validations/access.validation');
const RecruiterValidation = require('../validations/recruiter.validation');

class AccessController {

    recruiterSignUp = async (req, res, next) => {
        const { error } = RecruiterValidation.recruiterValidate(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await accessService.recruiterSignUp(req.body);
        new CREATED({
            message: message,
            metadata: {...metadata}
        }).send(res)
    }

    recruiterVerifyEmail = async (req, res, next) => {
        const email = req.query.email;
        const { otp } = req.body;
        const { message } = await accessService.recruiterVerifyEmail(email, otp);
        new OK({
            message: message
        }).send(res)
    }

    recruiterResendVerifyEmail = async (req, res, next) => {
        const { message, metadata } = await accessService.recruiterResendVerifyEmail(req.body);
        new OK({
            message: message,
            metadata: {...metadata}
        }).send(res)
    }

    login = async (req, res, next) => {
        const { error } = AccessValidation.loginValidate(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await accessService.login(req.body);
        new OK({
            message: message,
            metadata: {...metadata}
        }).send(res)
    }
}

module.exports = new AccessController();