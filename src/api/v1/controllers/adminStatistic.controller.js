const AdminStatisticService = require("../services/adminStatistic.service");
const { OK } = require('../core/success.response')

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
}

module.exports = new AdminStatisticController();