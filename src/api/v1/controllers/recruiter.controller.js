const RecruiterService = require("../services/recruiter.service");
const RecruiterValidation = require("../validations/recruiter.validation");
const { CREATED, OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const { formatInTimeZone } = require("date-fns-tz");
const { config } = require('../configs/config.vnpayment');
const { sortObject } = require("../utils");

class RecruiterController {

    getInformation = async (req, res, next) => {
        const { metadata, message } = await RecruiterService.getInformation(req.payload);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateInformation = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateUpdateInformation({ ...req.body, ...req.files });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.updateInformation({ ...value, ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    updateAvatar = async (req, res, next) => {
        const { error, value } = RecruiterValidation.validateUpdateAvatar({ ...req.body, ...req.files });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await RecruiterService.updateAvatar({ ...value, ...req.payload });
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
            throw new BadRequestError(error.details[0].message);
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
        const companyName = req.recruiter.companyName;
        const { metadata, message } = await RecruiterService.approveApplication({ ...value, ...req.payload, companyName });
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

    checkOut = async (req, res, next) => {
        try {
            var ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            var tmnCode = config['vnp_TmnCode'];
            var secretKey = config['vnp_HashSecret'];
            var vnpUrl = config['vnp_Url'];
            var returnUrl = config['vnp_ReturnUrl'];

            var date = new Date();

            var createDate = formatInTimeZone(date, "Asia/Ho_Chi_Minh", "yyyyMMddHHmmss");
            var orderId = formatInTimeZone(date, "Asia/Ho_Chi_Minh", "HHmmss");
            var amount = req.body.amount;
            var bankCode = req.body.bankCode;

            var orderType = req.body.orderType;
            var locale = req.body.language;
            if (locale === null || locale === '') {
                locale = 'vn';
            }
            var currCode = 'VND';
            var vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            // vnp_Params['vnp_Merchant'] = ''
            vnp_Params['vnp_Locale'] = locale;
            vnp_Params['vnp_CurrCode'] = currCode;
            vnp_Params['vnp_TxnRef'] = orderId;
            vnp_Params['vnp_OrderInfo'] = "Thanh toán cho mã giao dịch: " + orderId;
            vnp_Params['vnp_OrderType'] = orderType;
            vnp_Params['vnp_Amount'] = amount * 100;
            vnp_Params['vnp_ReturnUrl'] = returnUrl;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;
            if (bankCode !== undefined && bankCode !== '') {
                vnp_Params['vnp_BankCode'] = bankCode;
            }

            vnp_Params = sortObject(vnp_Params);
            console.log(vnp_Params)
            var querystring = require('qs');
            var signData = querystring.stringify(vnp_Params, { encode: false });
            var crypto = require("crypto");
            var hmac = crypto.createHmac("sha512", secretKey);
            var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
            vnp_Params['vnp_SecureHash'] = signed;
            vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
            console.log(vnpUrl)
            res.redirect(vnpUrl)
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new RecruiterController;