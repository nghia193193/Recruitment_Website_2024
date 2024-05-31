const RecruiterService = require("../services/recruiter.service");
const RecruiterValidation = require("../validations/recruiter.validation");
const { CREATED, OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const { clearImage } = require("../utils/processImage");

class RecruiterController {
    signUp = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateSignUp(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.signUp(value);
        new CREATED({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    verifyEmail = async (req, res, next) => {
        const email = req.query.email;
        const { otp } = req.body;
        const { message } = await RecruiterService.verifyEmail(email, otp);
        new OK({
            message: message
        }).send(res)
    }

    resendVerifyEmail = async (req, res, next) => {
        const { message, metadata } = await RecruiterService.resendVerifyEmail(req.body);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getInformation = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.getInformation(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateInformation = async (req, res, next) => {
        let companyLogo, companyCoverPhoto;
        if (req.files['companyLogo'] && req.files['companyCoverPhoto']) {
            const splitArrLogo = req.files['companyLogo'][0].path.split("\\");
            const splitArrCoverPhoto = req.files['companyCoverPhoto'][0].path.split("\\");
            companyLogo = `http://localhost:${process.env.PORT}/images/${splitArrLogo[splitArrLogo.length - 1]}`;
            companyCoverPhoto = `http://localhost:${process.env.PORT}/images/${splitArrCoverPhoto[splitArrCoverPhoto.length - 1]}`;
        } else {
            // xử lý field cho phép nhưng không phải là logo, coverphoto
            const wrongField = req.files['avatar'];
            console.log(wrongField)
            if (wrongField) {
                const splitWF = wrongField[0].path.split("\\");
                const file = splitWF[splitWF.length - 1];
                clearImage(file);
            }
            throw new BadRequestError("Chưa upload ảnh đại diện và ảnh bìa!");
        }
        const { error, value } = RecruiterValidation.validateUpdateInformation({ ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.updateInformation({ ...value, ...req.payload, companyLogo, companyCoverPhoto });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateAvatar = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateUpdateAvatar(req.files);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { avatar } = value;
        value.avatar = `http://localhost:${process.env.PORT}/images/${avatar[0].filename}`;
        const { metadata, message } = await RecruiterService.updateAvatar({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateProfile = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateUpdateProfile(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.updateProfile({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateCompany = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateUpdateCompany({ ...req.body, ...req.files });
        if (error) {
            const { companyLogo, companyCoverPhoto } = value;
            if (companyLogo) {
                clearImage(companyLogo[0].filename)
            }
            if (companyCoverPhoto) {
                clearImage(companyCoverPhoto[0].filename)
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
        const { metadata, message } = await RecruiterService.updateCompany({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    changePassword = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateChangePassword(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message } = await RecruiterService.changePassword({ ...req.payload, ...value })
        new OK({
            message: message
        }).send(res)
    }

    getListRecruiterHomePage = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateGetListRecruiterHomePage(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await RecruiterService.getListRecruiterHomePage(value);
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getInformationBySlug = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateGetRecruiterInformationBySlug(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await RecruiterService.getInformationBySlug(value);
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListRelatedRecruiter = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateGetListRelatedRecruiter({ ...req.query, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await RecruiterService.getListRelatedRecruiter(value);
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    createJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateCreateJob(req.body);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.createJob({ ...value, ...req.payload });
        new CREATED({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getJobDetail = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateJobId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.getJobDetail({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getJobStatus = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.getJobStatus();
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    changeJobStatus = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateChangeJobStatus({ ...req.body, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.changeJobStatus({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateUpdateJob({ ...req.body, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.updateJob({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListWaitingJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateRecruiterGetListJob({ ...req.body, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await RecruiterService.getListWaitingJob({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getListAcceptedJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateRecruiterGetListJob({ ...req.body, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await RecruiterService.getListAcceptedJob({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getListDeclinedJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateRecruiterGetListJob({ ...req.body, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await RecruiterService.getListDeclinedJob({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getListNearingExpirationdJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateRecruiterGetListJob({ ...req.body, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await RecruiterService.getListNearingExpirationdJob({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getListExpiredJob = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateRecruiterGetListJob({ ...req.body, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await RecruiterService.getListExpiredJob({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getListJobApplicationExperience = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateJobId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await RecruiterService.getListJobApplicationExperience({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getListJobApplication = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateGetListJobApplication({ ...req.params, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await RecruiterService.getListJobApplication({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getApplicationDetail = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateApplicationId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.getApplicationDetail({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    approveApplication = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateApproveApplication({ ...req.params, ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.approveApplication({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListApplicationStatus = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.getListApplicationStatus();
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListNotification = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.getListNotification(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    readNotification = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateReadNotification(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.readNotification({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    createPayment = async (req, res, next) => {
        var ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        const { metadata, message } = await RecruiterService.createPayment({ ...req.payload, ...req.body, ipAddr });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    getVNPayIPN = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.getVNPayIPN({ reqQuery: req.query });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    checkPremiumAccount = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.checkPremiumAccount(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new RecruiterController;