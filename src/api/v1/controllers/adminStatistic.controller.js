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

    totalBlogStatistic = async (req, res, next) => {
        const { message, metadata } = await AdminStatisticService.totalBlogStatistic();
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
        const { totalRevenue, monthlyDetails, month, year } = await AdminStatisticService.caculateRevenueByMonth(value);
        new OK({
            message: "Lấy doanh thu theo tháng thành công.",
            metadata: { totalRevenue, monthlyDetails, month, year }
        }).send(res)
    }

    caculateRevenueByYear = async (req, res, next) => {
        const { error, value } = AdminStatisticValidation.validateCaculateRevenueByYear(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { totalRevenue, yearlyDetails, year } = await AdminStatisticService.caculateRevenueByYear(value);
        new OK({
            message: "Lấy doanh thu theo năm thành công.",
            metadata: { totalRevenue, yearlyDetails, year }
        }).send(res)
    }

    applicationStatistic = async (req, res, next) => {
        const { error, value } = AdminStatisticValidation.validateDateFromTo(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { totalApplications, totalSubmitted, totalAccepted, totalRejected, 
            dailyDetails, startDate, endDate } = await AdminStatisticService.applicationStatistic(value);
        new OK({
            message: "Thống kê ứng tuyển thành công.",
            metadata: { startDate, endDate, totalApplications, totalSubmitted, totalAccepted, totalRejected, dailyDetails }
        }).send(res)
    }

    applicationStatisticByMonth = async (req, res, next) => {
        const { error, value } = AdminStatisticValidation.validateMonthYear(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { totalApplications, totalSubmitted, totalAccepted, totalRejected, 
            monthlyDetails, month, year } = await AdminStatisticService.applicationStatisticByMonth(value);
        new OK({
            message: "Thống kê ứng tuyển theo tháng thành công.",
            metadata: { month, year, totalApplications, totalSubmitted, totalAccepted, totalRejected, monthlyDetails }
        }).send(res)
    }

    applicationStatisticByYear = async (req, res, next) => {
        const { error, value } = AdminStatisticValidation.validateYear(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { totalApplications, totalSubmitted, totalAccepted, totalRejected, 
            yearlyDetails, year } = await AdminStatisticService.applicationStatisticByYear(value);
        new OK({
            message: "Thống kê ứng tuyển theo năm thành công.",
            metadata: { year, totalApplications, totalSubmitted, totalAccepted, totalRejected, yearlyDetails }
        }).send(res)
    }

    jobStatistic = async (req, res, next) => {
        const { error, value } = AdminStatisticValidation.validateDateFromTo(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { startDate, endDate, totalJobs, totalWaiting, totalAccepted, 
            totalRejected, dailyDetails } = await AdminStatisticService.jobStatistic(value);
        new OK({
            message: "Thống kê công việc thành công.",
            metadata: { startDate, endDate, totalJobs, totalWaiting, totalAccepted, totalRejected, dailyDetails }
        }).send(res)
    }

    jobStatisticByMonth = async (req, res, next) => {
        const { error, value } = AdminStatisticValidation.validateMonthYear(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { month, year, totalJobs, totalWaiting, totalAccepted, 
            totalRejected, monthlyDetails } = await AdminStatisticService.jobStatisticByMonth(value);
        new OK({
            message: "Thống kê công việc theo tháng thành công.",
            metadata: { month, year, totalJobs, totalWaiting, totalAccepted, totalRejected, monthlyDetails }
        }).send(res)
    }

    jobStatisticByYear = async (req, res, next) => {
        const { error, value } = AdminStatisticValidation.validateYear(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { year, totalJobs, totalWaiting, totalAccepted, 
            totalRejected, yearlyDetails } = await AdminStatisticService.jobStatisticByYear(value);
        new OK({
            message: "Thống kê công việc theo năm thành công.",
            metadata: { year, totalJobs, totalWaiting, totalAccepted, totalRejected, yearlyDetails }
        }).send(res)
    }

    recruiterStatisticByYear = async (req, res, next) => {
        const { error, value } = AdminStatisticValidation.validateYear(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { year, totalNewRecruiters, yearlyDetails } = await AdminStatisticService.recruiterStatisticByYear(value);
        new OK({
            message: "Thống kê nhà tuyển dụng mới theo năm thành công.",
            metadata: { year, totalNewRecruiters, yearlyDetails }
        }).send(res)
    }
}

module.exports = new AdminStatisticController();