const mongoose = require('mongoose');
const { Application } = require('../models/application.model');
const { formatInTimeZone } = require('date-fns-tz');

class RecruiterStatisticService {
    static applicationStatistic = async ({ recruiterId, startDate, endDate }) => {
        const stats = await Application.aggregate([
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'jobId',
                    foreignField: '_id',
                    as: 'jobDetails'
                }
            },
            {
                $match: {
                    'jobDetails.recruiterId': new mongoose.Types.ObjectId(recruiterId),
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $addFields: {
                    date: {
                        $dateToString: { format: "%d/%m/%Y", date: "$createdAt" }
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
                    dailyDetails: 1
                }
            }
        ]);
        return {
            totalApplications: stats[0].totalApplications,
            totalSubmitted: stats[0].totalSubmitted,
            totalAccepted: stats[0].totalAccepted,
            totalRejected: stats[0].totalRejected,
            dailyDetails: stats[0].dailyDetails,
            startDate: formatInTimeZone(startDate, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy'),
            endDate: formatInTimeZone(endDate, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy')
        };
    }

    static applicationStatisticByMonth = async ({ recruiterId, month, year }) => {
        const stats = await Application.aggregate([
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'jobId',
                    foreignField: '_id',
                    as: 'jobDetails'
                }
            },
            {
                $match: {
                    'jobDetails.recruiterId': new mongoose.Types.ObjectId(recruiterId),
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
            totalApplications: stats[0].totalApplications,
            totalSubmitted: stats[0].totalSubmitted,
            totalAccepted: stats[0].totalAccepted,
            totalRejected: stats[0].totalRejected,
            monthlyDetails: stats[0].monthlyDetails
        };
    }

    static applicationStatisticByYear = async ({ recruiterId, year }) => {
        const stats = await Application.aggregate([
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'jobId',
                    foreignField: '_id',
                    as: 'jobDetails'
                }
            },
            {
                $match: {
                    'jobDetails.recruiterId': new mongoose.Types.ObjectId(recruiterId),
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
            totalApplications: stats[0].totalApplications,
            totalSubmitted: stats[0].totalSubmitted,
            totalAccepted: stats[0].totalAccepted,
            totalRejected: stats[0].totalRejected,
            yearlyDetails: stats[0].yearlyDetails
        };
    }
}

module.exports = RecruiterStatisticService;