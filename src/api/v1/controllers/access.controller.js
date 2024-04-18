'use strict'

const { BadRequestError } = require('../core/error.response');
const { CREATED, OK } = require('../core/success.response');
const AccessService = require('../services/access.service');
const AccessValidation = require('../validations/access.validation');
const RecruiterValidation = require('../validations/recruiter.validation');

class AccessController {

    recruiterSignUp = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateSignUp(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AccessService.recruiterSignUp(value);
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
        const { error, value } = AccessValidation.validateLogin(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await AccessService.login(value);
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
        const { message, metadata } = await AccessService.getFieldOfActivity();
        new OK({
            message,
            metadata: {...metadata}
        }).send(res)
    }

    getJobType = async (req, res, next) => {
        const { message, metadata } = await AccessService.getJobType();
        new OK({
            message,
            metadata: {...metadata}
        }).send(res)
    }

    getLevelRequirement = async (req, res, next) => {
        const { message, metadata } = await AccessService.getLevelRequirement();
        new OK({
            message,
            metadata: {...metadata}
        }).send(res)
    }

    getExperience = async (req, res, next) => {
        const { message, metadata } = await AccessService.getExperience();
        new OK({
            message,
            metadata: {...metadata}
        }).send(res)
    }

    getGenderRequirement = async (req, res, next) => {
        const { message, metadata } = await AccessService.getGenderRequirement();
        new OK({
            message,
            metadata: {...metadata}
        }).send(res)
    }

    getProvince = async (req, res, next) => {
        const { message, metadata } = await AccessService.getProvince();
        new OK({
            message,
            metadata: {...metadata}
        }).send(res)
    }
}

module.exports = new AccessController();