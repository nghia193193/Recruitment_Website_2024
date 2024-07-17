const { formatInTimeZone } = require("date-fns-tz");
const { InternalServerError } = require("../core/error.response");
const { Report } = require("../models/report.model");
const { Job } = require("../models/job.model");
const { default: mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

class ReportService {
    // Tạo báo cáo
    static createReport = async ({ jobId, name, phone, email, content }) => {
        try {
            const job = await Job.findById(jobId).lean();
            if (!job) throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại sau.");
            const report = await Report.create({ jobId, name, phone, email, content });
            if (!report) throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại sau.");
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách báo cáo của công việc
    static getListReportOfJob = async ({ jobId, page, limit }) => {
        try {
            page = page ? page : 1;
            limit = limit ? limit : 5;
            const job = await Job.findById(jobId).lean();
            if (!job) throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại sau.");
            const length = await Report.find({ jobId }).countDocuments();
            let reports = await Report.find({ jobId })
                .skip((page - 1) * limit)
                .limit(limit)
            reports = reports.map(report => {
                report = report.toObject();
                report.createdAt = formatInTimeZone(report.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
                return report;
            })
            if (!reports) throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại sau.");
            return {
                length, reports, page, limit
            };
        } catch (error) {
            throw error;
        }
    }

    // Đọc báo cáo
    static readReport = async ({ jobId, reportId }) => {
        try {
            const job = await Job.findById(jobId).lean();
            if (!job) throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại sau.");
            const report = await Report.findOne({ _id: reportId, jobId }).lean();
            if (!report) throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại sau.");
            report.createdAt = formatInTimeZone(report.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
            return report;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ReportService;