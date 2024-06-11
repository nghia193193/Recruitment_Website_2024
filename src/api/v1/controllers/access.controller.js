'use strict'

const { BadRequestError } = require('../core/error.response');
const { CREATED, OK } = require('../core/success.response');
const AccessService = require('../services/access.service');
const { majors } = require('../utils');
const AccessValidation = require('../validations/access.validation');

class AccessController {
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

    forgetPassword = async (req, res, next) => {
        const { error, value } = AccessValidation.validateForgetPassword(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await AccessService.forgetPassword(value);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    resetPassword = async (req, res, next) => {
        const { error, value } = AccessValidation.validateResetPassword({ ...req.body, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await AccessService.resetPassword(value);
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

    getResumeExperience = async (req, res, next) => {
        const { message, metadata } = await AccessService.getResumeExperience();
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

    getWorkStatus = async (req, res, next) => {
        const { message, metadata } = await AccessService.getWorkStatus();
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListMajor = async (req, res, next) => {
        const message = "Lấy danh sách chuyên ngành thành công";
        const metadata = {
            ListMajor: majors
        }
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new AccessController();