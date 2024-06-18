const { Candidate } = require('../models/candidate.model');
const { Recruiter } = require('../models/recruiter.model');
const { Job } = require('../models/job.model');
const { Order } = require('../models/order.model');
const { formatInTimeZone } = require('date-fns-tz');
const { Application } = require('../models/application.model');

class AdminStatisticService {
    static totalCandidateStatistic = async () => {
        try {
            const number = await Candidate.find({ verifyEmail: true }).countDocuments();
            return {
                message: "Lấy số lượng ứng viên trong hệ thống thành công.",
                metadata: {
                    number
                }
            }
        } catch (error) {
            throw error;
        }
    }
    static totalRecruiterStatistic = async () => {
        try {
            const number = await Recruiter.find({ verifyEmail: true }).countDocuments();
            return {
                message: "Lấy số lượng nhà tuyển dụng trong hệ thống thành công.",
                metadata: {
                    number
                }
            }
        } catch (error) {
            throw error;
        }
    }
    static totalJobStatistic = async () => {
        try {
            const number = await Job.find().countDocuments();
            return {
                message: "Lấy số lượng công việc trong hệ thống thành công.",
                metadata: {
                    number
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static caculateRevenue = async ({ startDate, endDate }) => {
        try {
            const result = await Order.aggregate([
                {
                    $match: {
                        status: "Thành công",
                        updatedAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                        dailyRevenue: { $sum: "$price" }
                    }
                },
                { $sort: { _id: 1 } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$dailyRevenue" },
                        dailyRevenues: {
                            $push: {
                                day: "$_id",
                                revenue: "$dailyRevenue"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalRevenue: 1,
                        dailyRevenues: {
                            $map: {
                                input: "$dailyRevenues",
                                as: "detail",
                                in: {
                                    day: {
                                        $concat: [
                                            { $arrayElemAt: [{ $split: ["$$detail.day", "-"] }, 2] }, // ngày
                                            "/",
                                            { $arrayElemAt: [{ $split: ["$$detail.day", "-"] }, 1] }, // tháng
                                            "/",
                                            { $arrayElemAt: [{ $split: ["$$detail.day", "-"] }, 0] }  // năm
                                        ]
                                    },
                                    revenue: "$$detail.revenue"
                                }
                            }
                        }
                    }
                }
            ]);
            if (result.length > 0) {
                result[0].dailyRevenues = result[0].dailyRevenues.map(item => {
                    return {
                        day: item.day,
                        revenue: item.revenue.toLocaleString("en-US")
                    }
                });
                return {
                    totalRevenue: result[0].totalRevenue.toLocaleString("en-US"),
                    dailyRevenues: result[0].dailyRevenues,
                    startDate: formatInTimeZone(startDate, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss"),
                    endDate: formatInTimeZone(endDate, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss")
                }
            } else {
                return {
                    totalRevenue: 0,
                    dailyRevenues: [],
                    startDate: formatInTimeZone(startDate, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss"),
                    endDate: formatInTimeZone(endDate, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss")
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static caculateRevenueByMonth = async ({ month, year }) => {
        try {
            const result = await Order.aggregate([
                {
                    $match: {
                        status: "Thành công",
                        $expr: {
                            $and: [
                                { $eq: [{ $month: "$updatedAt" }, month] },
                                { $eq: [{ $year: "$updatedAt" }, year] }
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            day: { $dayOfMonth: "$updatedAt" },
                            month: { $month: "$updatedAt" },
                            year: { $year: "$updatedAt" }
                        },
                        dailyRevenue: { $sum: "$price" }
                    }
                }, { $sort: { "_id.day": 1 } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$dailyRevenue" },
                        details: { $push: { day: "$_id.day", revenue: "$dailyRevenue" } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalRevenue: 1,
                        monthlyDetails: "$details"
                    }
                }
            ]);
            if (result.length > 0) {
                result[0].monthlyDetails = result[0].monthlyDetails.map(item => {
                    return {
                        day: item.day,
                        revenue: item.revenue.toLocaleString("en-US")
                    }
                });
                return {
                    totalRevenue: result[0].totalRevenue.toLocaleString("en-US"),
                    monthlyDetails: result[0].monthlyDetails,
                    month,
                    year
                };
            } else {
                return {
                    totalRevenue: 0,
                    monthlyDetails: [],
                    month,
                    year
                };
            }
        } catch (error) {
            throw error;
        }
    }

    static caculateRevenueByYear = async ({ year }) => {
        try {
            let result = await Order.aggregate([
                {
                    $match: {
                        status: "Thành công",
                        $expr: {
                            $eq: [{ $year: "$createdAt" }, year]
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" }
                        },
                        monthlyRevenue: { $sum: "$price" }
                    }
                }, { $sort: { "_id.month": 1 } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$monthlyRevenue" },
                        details: { $push: { month: "$_id.month", revenue: "$monthlyRevenue" } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalRevenue: 1,
                        yearlyDetails: "$details"
                    }
                }
            ]);
            if (result.length > 0) {
                result[0].yearlyDetails = result[0].yearlyDetails.map(item => {
                    return {
                        month: item.month,
                        revenue: item.revenue.toLocaleString("en-US")
                    }
                });
                return {
                    totalRevenue: result[0].totalRevenue.toLocaleString("en-US"),
                    yearlyDetails: result[0].yearlyDetails,
                    year
                };
            } else {
                return {
                    totalRevenue: 0,
                    yearlyDetails: [],
                    year
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static applicationStatistic = async ({ startDate, endDate }) => {
        try {
            const stats = await Application.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                    }
                },
                {
                    $addFields: {
                        date: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        }
                    }
                },
                {
                    $group: {
                        _id: "$date",
                        dailyTotalApplications: { $sum: 1 },
                        dailySubmitted: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Đã nộp"] }, 1, 0]
                            }
                        },
                        dailyAccepted: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Đã nhận"] }, 1, 0]
                            }
                        },
                        dailyRejected: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Không nhận"] }, 1, 0]
                            }
                        }
                    },
                },
                { $sort: { _id: 1 } },
                {
                    $group: {
                        _id: null,
                        totalApplications: { $sum: "$dailyTotalApplications" },
                        totalSubmitted: { $sum: "$dailySubmitted" },
                        totalAccepted: { $sum: "$dailyAccepted" },
                        totalRejected: { $sum: "$dailyRejected" },
                        dailyDetails: {
                            $push: {
                                day: "$_id",
                                totalApplications: "$dailyTotalApplications",
                                submitted: "$dailySubmitted",
                                accepted: "$dailyAccepted",
                                rejected: "$dailyRejected"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalApplications: 1,
                        totalSubmitted: 1,
                        totalAccepted: 1,
                        totalRejected: 1,
                        dailyDetails: {
                            $map: {
                                input: "$dailyDetails",
                                as: "detail",
                                in: {
                                    day: {
                                        $concat: [
                                            { $arrayElemAt: [{ $split: ["$$detail.day", "-"] }, 2] }, // ngày
                                            "/",
                                            { $arrayElemAt: [{ $split: ["$$detail.day", "-"] }, 1] }, // tháng
                                            "/",
                                            { $arrayElemAt: [{ $split: ["$$detail.day", "-"] }, 0] }  // năm
                                        ]
                                    },
                                    submitted: "$$detail.submitted",
                                    accepted: "$$detail.accepted",
                                    rejected: "$$detail.rejected"
                                }
                            }
                        }
                    }
                }
            ]);
            return {
                totalApplications: stats[0]?.totalApplications ?? 0,
                totalSubmitted: stats[0]?.totalSubmitted ?? 0,
                totalAccepted: stats[0]?.totalAccepted ?? 0,
                totalRejected: stats[0]?.totalRejected ?? 0,
                dailyDetails: stats[0]?.dailyDetails ?? [],
                startDate: formatInTimeZone(startDate, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy'),
                endDate: formatInTimeZone(endDate, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy')
            };
        } catch (error) {
            throw error;
        }
    }

    static applicationStatisticByMonth = async ({ month, year }) => {
        try {
            const stats = await Application.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: [{ $month: "$createdAt" }, month] },
                                { $eq: [{ $year: "$createdAt" }, year] }
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            day: { $dayOfMonth: "$createdAt" },
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" }
                        },
                        dailyTotalApplications: { $sum: 1 },
                        dailySubmitted: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Đã nộp"] }, 1, 0]
                            }
                        },
                        dailyAccepted: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Đã nhận"] }, 1, 0]
                            }
                        },
                        dailyRejected: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Không nhận"] }, 1, 0]
                            }
                        }
                    },
                },
                { $sort: { "_id.day": 1 } },
                {
                    $group: {
                        _id: null,
                        totalApplications: { $sum: "$dailyTotalApplications" },
                        totalSubmitted: { $sum: "$dailySubmitted" },
                        totalAccepted: { $sum: "$dailyAccepted" },
                        totalRejected: { $sum: "$dailyRejected" },
                        monthlyDetails: {
                            $push: {
                                day: "$_id.day",
                                totalApplications: "$dailyTotalApplications",
                                submitted: "$dailySubmitted",
                                accepted: "$dailyAccepted",
                                rejected: "$dailyRejected"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalApplications: 1,
                        totalSubmitted: 1,
                        totalAccepted: 1,
                        totalRejected: 1,
                        monthlyDetails: 1
                    }
                }
            ]);
            return {
                month,
                year,
                totalApplications: stats[0]?.totalApplications ?? 0,
                totalSubmitted: stats[0]?.totalSubmitted ?? 0,
                totalAccepted: stats[0]?.totalAccepted ?? 0,
                totalRejected: stats[0]?.totalRejected ?? 0,
                monthlyDetails: stats[0]?.monthlyDetails ?? []
            };
        } catch (error) {
            throw error;
        }
    }

    static applicationStatisticByYear = async ({ year }) => {
        try {

            const stats = await Application.aggregate([
                {
                    $match: {
                        $expr: {
                            $eq: [{ $year: "$createdAt" }, year]
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" }
                        },
                        monthlyTotalApplications: { $sum: 1 },
                        monthlySubmitted: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Đã nộp"] }, 1, 0]
                            }
                        },
                        monthlyAccepted: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Đã nhận"] }, 1, 0]
                            }
                        },
                        monthlyRejected: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "Không nhận"] }, 1, 0]
                            }
                        }
                    },
                },
                { $sort: { "_id.month": 1 } },
                {
                    $group: {
                        _id: null,
                        totalApplications: { $sum: "$monthlyTotalApplications" },
                        totalSubmitted: { $sum: "$monthlySubmitted" },
                        totalAccepted: { $sum: "$monthlyAccepted" },
                        totalRejected: { $sum: "$monthlyRejected" },
                        yearlyDetails: {
                            $push: {
                                month: "$_id.month",
                                totalApplications: "$monthlyTotalApplications",
                                submitted: "$monthlySubmitted",
                                accepted: "$monthlyAccepted",
                                rejected: "$monthlyRejected"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalApplications: 1,
                        totalSubmitted: 1,
                        totalAccepted: 1,
                        totalRejected: 1,
                        yearlyDetails: 1
                    }
                }
            ]);
            return {
                year,
                totalApplications: stats[0]?.totalApplications ?? 0,
                totalSubmitted: stats[0]?.totalSubmitted ?? 0,
                totalAccepted: stats[0]?.totalAccepted ?? 0,
                totalRejected: stats[0]?.totalRejected ?? 0,
                yearlyDetails: stats[0]?.yearlyDetails ?? []
            };
        } catch (error) {
            throw error;
        }
    }

    static jobStatistic = async ({ startDate, endDate }) => {
        try {
            const stats = await Job.aggregate([
                {
                    $match: {
                        updatedAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                    }
                },
                {
                    $addFields: {
                        date: {
                            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" }
                        }
                    }
                },
                {
                    $group: {
                        _id: "$date",
                        dailyTotalJobs: { $sum: 1 },
                        dailyWaiting: {
                            $sum: {
                                $cond: [{ $eq: ["$acceptanceStatus", "waiting"] }, 1, 0]
                            }
                        },
                        dailyAccepted: {
                            $sum: {
                                $cond: [{ $eq: ["$acceptanceStatus", "accept"] }, 1, 0]
                            }
                        },
                        dailyRejected: {
                            $sum: {
                                $cond: [{ $eq: ["$acceptanceStatus", "decline"] }, 1, 0]
                            }
                        }
                    },
                },
                { $sort: { _id: 1 } },
                {
                    $group: {
                        _id: null,
                        totalJobs: { $sum: "$dailyTotalJobs" },
                        totalWaiting: { $sum: "$dailyWaiting" },
                        totalAccepted: { $sum: "$dailyAccepted" },
                        totalRejected: { $sum: "$dailyRejected" },
                        dailyDetails: {
                            $push: {
                                day: "$_id",
                                totalJobs: "$dailyTotalJobs",
                                waiting: "$dailyWaiting",
                                accepted: "$dailyAccepted",
                                rejected: "$dailyRejected"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalJobs: 1,
                        totalWaiting: 1,
                        totalAccepted: 1,
                        totalRejected: 1,
                        dailyDetails: {
                            $map: {
                                input: "$dailyDetails",
                                as: "detail",
                                in: {
                                    day: {
                                        $concat: [
                                            { $arrayElemAt: [{ $split: ["$$detail.day", "-"] }, 2] }, // ngày
                                            "/",
                                            { $arrayElemAt: [{ $split: ["$$detail.day", "-"] }, 1] }, // tháng
                                            "/",
                                            { $arrayElemAt: [{ $split: ["$$detail.day", "-"] }, 0] }  // năm
                                        ]
                                    },
                                    totalJobs: "$$detail.totalJobs",
                                    waiting: "$$detail.waiting",
                                    accepted: "$$detail.accepted",
                                    rejected: "$$detail.rejected"
                                }
                            }
                        }
                    }
                }
            ]);
            return {
                totalJobs: stats[0].totalJobs,
                totalWaiting: stats[0].totalWaiting,
                totalAccepted: stats[0].totalAccepted,
                totalRejected: stats[0].totalRejected,
                dailyDetails: stats[0].dailyDetails,
                startDate: formatInTimeZone(startDate, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy'),
                endDate: formatInTimeZone(endDate, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy')
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminStatisticService;