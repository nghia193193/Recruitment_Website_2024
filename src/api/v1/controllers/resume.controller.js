const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");
const ResumeService = require("../services/resume.service");
const { clearImage } = require("../utils/processImage");
const ResumeValidation = require("../validations/resume.validation");

class ResumeController {
    getListResume = async (req, res, next) => {
        const { error, value } = ResumeValidation.validateGetListResume(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await ResumeService.getListResume({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getResumeDetail = async (req, res, next) => {
        const { error, value } = ResumeValidation.validateResumeId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await ResumeService.getResumeDetail({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }
    
    addResume = async (req, res, next) => {
        const { error, value } = ResumeValidation.validateAddResume({ ...req.body, ...req.files });
        if (error) {
            const { avatar, companyLogo, companyCoverPhoto, uploadFile } = value;
            if (avatar) {
                if (Array.isArray(avatar)) {
                    clearImage(avatar[0].filename);
                }
            }
            if (companyLogo) {
                if (Array.isArray(companyLogo)) {
                    clearImage(companyLogo[0].filename);
                }
            }
            if (companyCoverPhoto) {
                if (Array.isArray(companyCoverPhoto)) {
                    clearImage(companyCoverPhoto[0].filename);
                }
            }
            if (uploadFile) {
                if (Array.isArray(uploadFile)) {
                    clearImage(uploadFile[0].filename);
                }
            }
            throw new BadRequestError(error.details[0].message);
        }
        const { avatar } = value;
        value.avatar = `${process.env.DOMAIN}/images/${avatar[0].filename}`;
        const { message, metadata } = await ResumeService.addResume({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
        }).send(res)
    }

    updateResume = async (req, res, next) => {
        const { error, value } = ResumeValidation.validateUpdateResume({ ...req.body, ...req.params, ...req.files });
        if (error) {
            const { avatar, companyLogo, companyCoverPhoto, uploadFile } = value;
            if (avatar) {
                if (Array.isArray(avatar)) {
                    clearImage(avatar[0].filename);
                }
            }
            if (companyLogo) {
                if (Array.isArray(companyLogo)) {
                    clearImage(companyLogo[0].filename);
                }
            }
            if (companyCoverPhoto) {
                if (Array.isArray(companyCoverPhoto)) {
                    clearImage(companyCoverPhoto[0].filename);
                }
            }
            if (uploadFile) {
                if (Array.isArray(uploadFile)) {
                    clearImage(uploadFile[0].filename);
                }
            }
            throw new BadRequestError(error.details[0].message);
        }
        const { avatar } = value;
        if (avatar) {
            value.avatar = `${process.env.DOMAIN}/images/${avatar[0].filename}`;
        }
        const { message, metadata } = await ResumeService.updateResume({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
        }).send(res)
    }

    deleteResume = async (req, res, next) => {
        const { error, value } = ResumeValidation.validateDeleteResume({ ...req.params, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await ResumeService.deleteResume({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    changeResumeStatus = async (req, res, next) => {
        const { error, value } = ResumeValidation.validateChangeStatus({ ...req.body, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await ResumeService.changeResumeStatus({ ...req.payload, ...value });
        new OK({
            message,
            metadata: { ...metadata },
        }).send(res)
    }

    getListEnglishResume = async (req, res, next) => {
        const { result, length } = await ResumeService.getListEnglishResume();
        new OK({
            message: "Lấy danh sách trình độ ngoại ngữ thành công.",
            metadata: { result, length }
        }).send(res)
    }

    advancedSearchForPremium = async (req, res, next) => {
        const { error, value } = ResumeValidation.validateGetListAdvanced(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await ResumeService.advancedSearchForPremium({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }
}

module.exports = new ResumeController();