const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");
const RecruiterStatisticService = require("../services/recruiterStatistic.service");
const RecruiterStatisticValidation = require("../validations/recruiterStatistic.validation");

class RecruiterStatisticController {
    applicationStatistic = async (req, res, next) => {
        const { error, value } = RecruiterStatisticValidation.validateApplicationStatistic(req.body);
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
        const { error, value } = RecruiterStatisticValidation.validateApplicationStatisticByMonth(req.body);
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
        const { error, value } = RecruiterStatisticValidation.validateApplicationStatisticByYear(req.body);
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
}

module.exports = new RecruiterStatisticController();