const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");
const RecruiterStatisticService = require("../services/recruiterStatistic.service");
const RecruiterStatisticValidation = require("../validations/recruiterStatistic.validation");

class RecruiterStatisticController {
    applicationStatistic = async (req, res, next) => {
        const { error, value } = RecruiterStatisticValidation.validateADateFromTo(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const {
            totalApplications,
            totalSubmitted,
            totalAccepted,
            totalRejected,
            dailyDetails, startDate, endDate } = await RecruiterStatisticService.applicationStatistic({
                recruiterId: req.payload.userId, ...value
            });
        new OK({
            message: 'Thống kê ứng tuyển thành công',
            metadata: {
                startDate,
                endDate,
                totalApplications,
                totalSubmitted,
                totalAccepted,
                totalRejected,
                dailyDetails
            }
        }).send(res);
    }

    applicationStatisticByMonth = async (req, res, next) => {
        const { error, value } = RecruiterStatisticValidation.validateMonthYear(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const {
            totalApplications,
            totalSubmitted,
            totalAccepted,
            totalRejected,
            monthlyDetails, month, year } = await RecruiterStatisticService.applicationStatisticByMonth({
                recruiterId: req.payload.userId, ...value
            });
        new OK({
            message: 'Thống kê ứng tuyển theo tháng thành công',
            metadata: {
                month,
                year,
                totalApplications,
                totalSubmitted,
                totalAccepted,
                totalRejected,
                monthlyDetails
            }
        }).send(res);
    }

    applicationStatisticByYear = async (req, res, next) => {
        const { error, value } = RecruiterStatisticValidation.validateYear(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const {
            totalApplications,
            totalSubmitted,
            totalAccepted,
            totalRejected,
            yearlyDetails, year } = await RecruiterStatisticService.applicationStatisticByYear({
                recruiterId: req.payload.userId, ...value
            });
        new OK({
            message: 'Thống kê ứng tuyển theo năm thành công',
            metadata: {
                year,
                totalApplications,
                totalSubmitted,
                totalAccepted,
                totalRejected,
                yearlyDetails
            }
        }).send(res);
    }

    jobStatistic = async (req, res, next) => {
        const { error, value } = RecruiterStatisticValidation.validateADateFromTo(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { startDate, endDate, totalJobs, totalWaiting, totalAccepted, dailyDetails,
            totalRejected } = await RecruiterStatisticService.jobStatistic({
                recruiterId: req.payload.userId, ...value
            });
        new OK({
            message: 'Thống kê công việc thành công',
            metadata: {
                startDate, endDate, totalJobs, totalJobs, totalWaiting, totalAccepted, totalRejected, dailyDetails
            }
        }).send(res);
    }

    jobStatisticByMonth = async (req, res, next) => {
        const { error, value } = RecruiterStatisticValidation.validateMonthYear(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { month, year, totalJobs, totalWaiting, totalAccepted,
            totalRejected, monthlyDetails } = await RecruiterStatisticService.jobStatisticByMonth({
                recruiterId: req.payload.userId, ...value
            });
        new OK({
            message: 'Thống kê công việc theo tháng thành công',
            metadata: {
                month, year, totalJobs, totalJobs, totalWaiting, totalAccepted, totalRejected, monthlyDetails
            }
        }).send(res);
    }

    jobStatisticByYear = async (req, res, next) => {
        const { error, value } = RecruiterStatisticValidation.validateYear(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { year, totalJobs, totalWaiting, totalAccepted,
            totalRejected, yearlyDetails } = await RecruiterStatisticService.jobStatisticByYear({
                recruiterId: req.payload.userId, ...value
            });
        new OK({
            message: 'Thống kê công việc theo năm thành công',
            metadata: {
                year, totalJobs, totalJobs, totalWaiting, totalAccepted, totalRejected, yearlyDetails
            }
        }).send(res);
    }

    jobHomePageStatistic = async (req, res, next) => {
        const { totalJobs, details } = await RecruiterStatisticService.jobHomePageStatistic({ recruiterId: req.payload.userId });
        new OK({
            message: 'Thống kê công việc trang chủ thành công',
            metadata: {
                totalJobs, details
            }
        }).send(res);
    }
}

module.exports = new RecruiterStatisticController();