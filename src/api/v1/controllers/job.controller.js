const { OK } = require('../core/success.response');
const JobService = require('../services/job.service');
const JobValidation = require('../validations/job.validation');

class JobController {
    getListJob = async (req, res, next) => {
        const { error, value } = JobValidation.validateGetListJob(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await JobService.getListJob(value);
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getJobDetail = async (req, res, next) => {
        const { error, value } = JobValidation.validateJobId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await JobService.getJobDetail(value);
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }

    getListJobOfRecruiter = async (req, res, next) => {
        const { error, value } = JobValidation.validateGetListJobOfRecruiter({ ...req.query, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await JobService.getListJobOfRecruiter(value);
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getListRelatedJobByField = async (req, res, next) => {
        const { error, value } = JobValidation.validateGetListRelatedJobByField({ ...req.query, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await JobService.getListRelatedJobByField(value);
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getListJobPremiumPrivilege = async (req, res, next) => {
        const { error, value } = JobValidation.validateGetListJobPremiumPrivilege(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await JobService.getListJobPremiumPrivilege({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    getListJobPremiumPrivilegeHome = async (req, res, next) => {
        const { error, value } = JobValidation.validateGetListJobPremiumPrivilegeHome(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await JobService.getListJobPremiumPrivilegeHome({ ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }
}

module.exports = new JobController();