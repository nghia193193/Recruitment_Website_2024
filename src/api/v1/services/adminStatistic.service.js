const { Candidate } = require('../models/candidate.model');
const { Recruiter } = require('../models/recruiter.model');
const { Job } = require('../models/job.model');
const { Order } = require('../models/order.model');
const { formatInTimeZone } = require('date-fns-tz');

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
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%d/%m/%Y", date: "$createdAt" } },
                        dailyRevenue: { $sum: "$price" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$dailyRevenue" },
                        dailyRevenues: {
                            $push: {
                                date: "$_id",
                                revenue: "$dailyRevenue"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalRevenue: 1,
                        dailyRevenues: 1
                    }
                }
            ]);
            if (result.length > 0) {
                result[0].dailyRevenues = result[0].dailyRevenues.map(item => {
                    return {
                        date: item.date,
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
                        dailyDetails: "$details"
                    }
                }
            ]);
            if (result.length > 0) {
                result[0].dailyDetails = result[0].dailyDetails.map(item => {
                    return {
                        day: item.day,
                        revenue: item.revenue.toLocaleString("en-US")
                    }
                });
                return {
                    totalRevenue: result[0].totalRevenue.toLocaleString("en-US"),
                    dailyDetails: result[0].dailyDetails,
                    month,
                    year
                };
            } else {
                return {
                    totalRevenue: 0,
                    dailyDetails: [],
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
                        monthlyDetails: "$details"
                    }
                }
            ]);
            if (result.length > 0) {
                result[0].monthlyDetails = result[0].monthlyDetails.map(item => {
                    return {
                        month: item.month,
                        revenue: item.revenue.toLocaleString("en-US")
                    }
                });
                return {
                    totalRevenue: result[0].totalRevenue.toLocaleString("en-US"),
                    monthlyDetails: result[0].monthlyDetails,
                    year
                };
            } else {
                return {
                    totalRevenue: 0,
                    monthlyDetails: [],
                    year
                }
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminStatisticService;