const { CREATED, OK } = require('../core/success.response');
const { BadRequestError } = require("../core/error.response");
const { clearImage } = require("../utils/processImage");
const AdminRecruiterManagementValidation = require("../validations/adminRecruiterManagement.validation");
const AdminRecruiterManagementService = require("../services/adminRecruiterManagement.service");

class AdminRecruiterManagementController {
    getListRecruiterByAdmin = async (req, res, next) => {
        const { error, value } = AdminRecruiterManagementValidation.validateGetListRecruiterByAdmin(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await AdminRecruiterManagementService.getListRecruiterByAdmin(value);
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    createRecruiter = async (req, res, next) => {
        const { error, value } = AdminRecruiterManagementValidation.validateCreateRecruiter({ ...req.body, ...req.files });
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
        const { metadata, message } = await AdminRecruiterManagementService.createRecruiter({ ...value });
        new CREATED({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateRecruiter = async (req, res, next) => {
        const { error, value } = AdminRecruiterManagementValidation.validateUpdateRecruiter({ ...req.body, ...req.files, ...req.params });
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
        const { metadata, message } = await AdminRecruiterManagementService.updateRecruiter({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getRecruiterInformation = async (req, res, next) => {
        const { error, value } = AdminRecruiterManagementValidation.validateRecruiterId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await AdminRecruiterManagementService.getRecruiterInformation({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    approveRecruiter = async (req, res, next) => {
        const { error, value } = AdminRecruiterManagementValidation.validateApproveRecruiter({ ...req.params, ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await AdminRecruiterManagementService.approveRecruiter({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
        }).send(res)
    }
}

module.exports = new AdminRecruiterManagementController();