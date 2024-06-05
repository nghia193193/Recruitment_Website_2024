const AdminService = require("../services/admin.service");
const { CREATED, OK } = require('../core/success.response');
const AdminValidation = require("../validations/admin.validation");
const { BadRequestError } = require("../core/error.response");
const { clearImage } = require("../utils/processImage");

class AdminController {
    getInformation = async (req, res, next) => {
        const { metadata, message } = await AdminService.getInformation(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListRecruiter = async (req, res, next) => {
        const { error, value } = AdminValidation.validateGetListRecruiter(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await AdminService.getListRecruiter({ ...req.body, ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    createRecruiter = async (req, res, next) => {
        const { error, value } = AdminValidation.validateCreateRecruiter({ ...req.body, ...req.files });
        if (error) {
            const { avatar, companyLogo, companyCoverPhoto, uploadFile } = value;
            if (uploadFile) {
                clearImage(uploadFile[0].filename);
            }
            if (avatar) {
                clearImage(avatar[0].filename);
            }
            if (companyLogo) {
                clearImage(companyLogo[0].filename);
            }
            if (companyCoverPhoto) {
                clearImage(companyCoverPhoto[0].filename);
            }
            throw new BadRequestError(error.details[0].message);
        }
        const { companyLogo, companyCoverPhoto } = value;
        if (companyLogo) {
            value.companyLogo = `http://localhost:${process.env.PORT}/images/${companyLogo[0].filename}`;
        }
        if (companyCoverPhoto) {
            value.companyCoverPhoto = `http://localhost:${process.env.PORT}/images/${companyCoverPhoto[0].filename}`;
        }
        const { metadata, message } = await AdminService.createRecruiter({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateRecruiter = async (req, res, next) => {
        const { error, value } = AdminValidation.validateUpdateRecruiter({ ...req.body, ...req.files, ...req.params });
        if (error) {
            const { avatar, companyLogo, companyCoverPhoto, uploadFile } = value;
            if (uploadFile) {
                clearImage(uploadFile[0].filename);
            }
            if (avatar) {
                clearImage(avatar[0].filename);
            }
            if (companyLogo) {
                clearImage(companyLogo[0].filename);
            }
            if (companyCoverPhoto) {
                clearImage(companyCoverPhoto[0].filename);
            }
            throw new BadRequestError(error.details[0].message);
        }
        const { companyLogo, companyCoverPhoto } = value;
        if (companyLogo) {
            value.companyLogo = `http://localhost:${process.env.PORT}/images/${companyLogo[0].filename}`;
        }
        if (companyCoverPhoto) {
            value.companyCoverPhoto = `http://localhost:${process.env.PORT}/images/${companyCoverPhoto[0].filename}`;
        }
        const { metadata, message } = await AdminService.updateRecruiter({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getRecruiterInformation = async (req, res, next) => {
        const { error, value } = AdminValidation.validateRecruiterId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await AdminService.getRecruiterInformation({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    approveRecruiter = async (req, res, next) => {
        const { error, value } = AdminValidation.validateApproveRecruiter({ ...req.params, ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AdminService.approveRecruiter({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
        }).send(res)
    }

    getListAcceptanceStatus = async (req, res, next) => {
        const { metadata, message } = await AdminService.getListAcceptanceStatus();
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    createJob = async (req, res, next) => {
        const { error, value } = AdminValidation.validateCreateJob({ ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AdminService.createJob({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateJob = async (req, res, next) => {
        const { error, value } = AdminValidation.validateUpdateJob({ ...req.body, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AdminService.updateJob({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    approveJob = async (req, res, next) => {
        const { error, value } = AdminValidation.validateApproveJob({ ...req.params, ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AdminService.approveJob({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
        }).send(res)
    }
}

module.exports = new AdminController();