const { BadRequestError } = require('../core/error.response');
const { OK, CREATED } = require("../core/success.response");
const ReportService = require('../services/report.service');
const ReportValidation = require('../validations/report.validation');

class ReportController {
    createReport = async (req, res, next) => {
        const { value, error } = ReportValidation.validateCreateReport({ ...req.params, ...req.body });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        await ReportService.createReport(value);
        new CREATED({
            message: "Báo cáo của bạn đã được ghi nhận. Chúng tôi sẽ xem xét và xử lý sớm nhất có thể. Xin chân thành cảm ơn!",
            metadata: {}
        }).send(res);
    }

    getListReportOfJob = async (req, res, next) => {
        const { value, error } = ReportValidation.validateGetListReportOfJob({ ...req.params, ...req.query });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { length, reports, page, limit } = await ReportService.getListReportOfJob(value);
        new OK({
            message: "Danh sách báo cáo",
            metadata: {
                length,
                listReport: reports
            },
            options: {
                page, limit
            }
        }).send(res);
    }

    readReport = async (req, res, next) => {
        const { value, error } = ReportValidation.validateReadReport(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const report = await ReportService.readReport(value);
        new OK({
            message: "Chi tiết báo cáo",
            metadata: report
        }).send(res);
    }   
}

module.exports = new ReportController();