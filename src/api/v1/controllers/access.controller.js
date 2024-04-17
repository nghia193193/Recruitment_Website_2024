'use strict'

const { BadRequestError } = require('../core/error.response');
const { CREATED, OK } = require('../core/success.response');
const AccessService = require('../services/access.service');
const AccessValidation = require('../validations/access.validation');
const RecruiterValidation = require('../validations/recruiter.validation');

class AccessController {

    recruiterSignUp = async (req, res, next) => {
        const { error } = RecruiterValidation.validateSignUp(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AccessService.recruiterSignUp(req.body);
        new CREATED({
            message: message,
            metadata: {...metadata}
        }).send(res)
    }

    recruiterVerifyEmail = async (req, res, next) => {
        const email = req.query.email;
        const { otp } = req.body;
        const { message } = await AccessService.recruiterVerifyEmail(email, otp);
        new OK({
            message: message
        }).send(res)
    }

    recruiterResendVerifyEmail = async (req, res, next) => {
        const { message, metadata } = await AccessService.recruiterResendVerifyEmail(req.body);
        new OK({
            message: message,
            metadata: {...metadata}
        }).send(res)
    }

    login = async (req, res, next) => {
        const { error } = AccessValidation.validateLogin(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await AccessService.login(req.body);
        new OK({
            message: message,
            metadata: {...metadata}
        }).send(res)
    }

    refreshAccessToken = async (req, res, next) => {
        const { message, metadata } = await AccessService.refreshAccessToken(req.body);
        new OK({
            message: message,
            metadata: {...metadata}
        }).send(res)
    }

    logout = async (req, res, next) => {
        const { message } = await AccessService.logout(req.body);
        new OK({
            message: message
        }).send(res)
    }

    getFieldOfActivity = async (req, res, next) => {
        const { message } = await AccessService.getFieldOfActivity();
        new OK({
            message: message
        }).send(res)
    }
}

module.exports = new AccessController();