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
            metadata: { ...metadata }
        }).send(res)
    }

    candidateSignUp = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateCandidateSignUp(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AccessService.candidateSignUp(value);
        new CREATED({
            message: message,
            metadata: { ...metadata }
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

    candidateVerifyEmail = async (req, res, next) => {
        const email = req.query.email;
        const { otp } = req.body;
        const { message } = await AccessService.candidateVerifyEmail(email, otp);
        new OK({
            message: message
        }).send(res)
    }

    recruiterResendVerifyEmail = async (req, res, next) => {
        const { message, metadata } = await AccessService.recruiterResendVerifyEmail(req.body);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    candidateResendVerifyEmail = async (req, res, next) => {
        const { message, metadata } = await AccessService.candidateResendVerifyEmail(req.body);
        new OK({
            message: message,
            metadata: { ...metadata }
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
            metadata: { ...metadata }
        }).send(res)
    }

    refreshAccessToken = async (req, res, next) => {
        const { message, metadata } = await AccessService.refreshAccessToken(req.body);
        new OK({
            message: message,
            metadata: { ...metadata }
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
            metadata: { ...metadata }
        }).send(res)
    }

    getJobType = async (req, res, next) => {
        const { message, metadata } = await AccessService.getJobType();
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    getLevelRequirement = async (req, res, next) => {
        const { message, metadata } = await AccessService.getLevelRequirement();
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    getExperience = async (req, res, next) => {
        const { message, metadata } = await AccessService.getExperience();
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    getGenderRequirement = async (req, res, next) => {
        const { message, metadata } = await AccessService.getGenderRequirement();
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    getProvince = async (req, res, next) => {
        const { message, metadata } = await AccessService.getProvince();
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListJob = async (req, res, next) => {
        const { error, value } = AccessValidation.validateGetListJob(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await AccessService.getListJob(value);
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getListRelatedJobByField = async (req, res, next) => {
        const { error, value } = AccessValidation.validateGetListRelatedJobByField({ ...req.query, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await AccessService.getListRelatedJobByField(value);
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getListJobOfRecruiter = async (req, res, next) => {
        const { error, value } = AccessValidation.validateGetListJobOfRecruiter({ ...req.query, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await AccessService.getListJobOfRecruiter(value);
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getJobDetail = async (req, res, next) => {
        const { error, value } = AccessValidation.validateJobId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await AccessService.getJobDetail(value);
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListRecruiter = async (req, res, next) => {
        const { error, value } = AccessValidation.validateGetListRecruiter(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await AccessService.getListRecruiter(value);
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getRecruiterInformation = async (req, res, next) => {
        const { error, value } = AccessValidation.validateGetRecruiterInformationBySlug(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await AccessService.getRecruiterInformation(value);
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    getWorkStatus = async (req, res, next) => {
        const { message, metadata } = await AccessService.getWorkStatus();
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new AccessController();