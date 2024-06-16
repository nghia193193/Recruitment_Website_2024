const AdminStatisticService = require("../services/adminStatistic.service");
const { OK } = require('../core/success.response');
const { BadRequestError } = require("../core/error.response");
const AdminStatisticValidation = require("../validations/adminStatistic.validation");

class AdminStatisticController {
    totalCandidateStatistic = async (req, res, next) => {
        const { message, metadata } = await AdminStatisticService.totalCandidateStatistic();
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    totalRecruiterStatistic = async (req, res, next) => {
        const { message, metadata } = await AdminStatisticService.totalRecruiterStatistic();
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    totalJobStatistic = async (req, res, next) => {
        const { message, metadata } = await AdminStatisticService.totalJobStatistic();
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    caculateRevenue = async (req, res, next) => {
        const { error, value } = AdminStatisticValidation.validateCaculateRevenue(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { totalRevenue, dailyRevenues, startDate, endDate } = await AdminStatisticService.caculateRevenue(value);
        new OK({
            message: "Lấy doanh thu thành công.",
            metadata: { totalRevenue, dailyRevenues, startDate, endDate }
        }).send(res)
    }

    caculateRevenueByMonth = async (req, res, next) => {
        const { error, value } = AdminStatisticValidation.validateCaculateRevenueByMonth(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { totalRevenue, dailyDetails, month, year } = await AdminStatisticService.caculateRevenueByMonth(value);
        new OK({
            message: "Lấy doanh thu theo tháng thành công.",
            metadata: { totalRevenue, dailyDetails, month, year }
        }).send(res)
    }

    caculateRevenueByYear = async (req, res, next) => {
        const { error, value } = AdminStatisticValidation.validateCaculateRevenueByYear(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { totalRevenue, monthlyDetails, year } = await AdminStatisticService.caculateRevenueByYear(value);
        new OK({
            message: "Lấy doanh thu theo năm thành công.",
            metadata: { totalRevenue, monthlyDetails, year }
        }).send(res)
    }
}

module.exports = new AdminStatisticController();