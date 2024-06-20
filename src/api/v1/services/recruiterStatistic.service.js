const mongoose = require('mongoose');
const { Application } = require('../models/application.model');
const { formatInTimeZone } = require('date-fns-tz');
const { Job } = require('../models/job.model');

class RecruiterStatisticService {
    static applicationStatistic = async ({ recruiterId, startDate, endDate }) => {
        try {
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

    static applicationStatisticByMonth = async ({ recruiterId, month, year }) => {
        try {
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

    static applicationStatisticByYear = async ({ recruiterId, year }) => {
        try {
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
                            $eq: [{ $year: "$updatedAt" }, year]
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$updatedAt" },
                            year: { $year: "$updatedAt" }
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

    static jobStatistic = async ({ recruiterId, startDate, endDate }) => {
        const stats = await Job.aggregate([
            {
                $match: {
                    recruiterId: new mongoose.Types.ObjectId(recruiterId),
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
                                $mergeObjects: ["$$detail", { 
                                    day: { 
                                        $dateToString: { format: "%d/%m/%Y", date: { $dateFromString: { dateString: "$$detail.day" } } } 
                                    } 
                                }]
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
    }

    static jobStatisticByMonth = async ({ recruiterId, month, year }) => {
        try {
            const stats = await Job.aggregate([
                {
                    $match: {
                        recruiterId: new mongoose.Types.ObjectId(recruiterId),
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
                { $sort: { "_id.day": 1 } },
                {
                    $group: {
                        _id: null,
                        totalJobs: { $sum: "$dailyTotalJobs" },
                        totalWaiting: { $sum: "$dailyWaiting" },
                        totalAccepted: { $sum: "$dailyAccepted" },
                        totalRejected: { $sum: "$dailyRejected" },
                        monthlyDetails: {
                            $push: {
                                day: "$_id.day",
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
                        monthlyDetails: 1
                    }
                }
            ]);
            return {
                month,
                year,
                totalJobs: stats[0]?.totalJobs ?? 0,
                totalWaiting: stats[0]?.totalWaiting ?? 0,
                totalAccepted: stats[0]?.totalAccepted ?? 0,
                totalRejected: stats[0]?.totalRejected ?? 0,
                monthlyDetails: stats[0]?.monthlyDetails ?? []
            };
        } catch (error) {
            throw error;
        }
    }

    static jobStatisticByYear = async ({ recruiterId, year }) => {
        try {
            const stats = await Job.aggregate([
                {
                    $match: {
                        recruiterId: new mongoose.Types.ObjectId(recruiterId),
                        $expr: {
                            $eq: [{ $year: "$updatedAt" }, year]
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$updatedAt" },
                            year: { $year: "$updatedAt" }
                        },
                        monthlyTotalJobs: { $sum: 1 },
                        monthlyWaiting: {
                            $sum: {
                                $cond: [{ $eq: ["$acceptanceStatus", "waiting"] }, 1, 0]
                            }
                        },
                        monthlyAccepted: {
                            $sum: {
                                $cond: [{ $eq: ["$acceptanceStatus", "accept"] }, 1, 0]
                            }
                        },
                        monthlyRejected: {
                            $sum: {
                                $cond: [{ $eq: ["$acceptanceStatus", "decline"] }, 1, 0]
                            }
                        }
                    },
                },
                { $sort: { "_id.month": 1 } },
                {
                    $group: {
                        _id: null,
                        totalJobs: { $sum: "$monthlyTotalJobs" },
                        totalWaiting: { $sum: "$monthlyWaiting" },
                        totalAccepted: { $sum: "$monthlyAccepted" },
                        totalRejected: { $sum: "$monthlyRejected" },
                        yearlyDetails: {
                            $push: {
                                month: "$_id.month",
                                totalJobs: "$monthlyTotalJobs",
                                waiting: "$monthlyWaiting",
                                accepted: "$monthlyAccepted",
                                rejected: "$monthlyRejected"
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
                        yearlyDetails: 1
                    }
                }
            ]);
            return {
                year,
                totalJobs: stats[0]?.totalJobs ?? 0,
                totalWaiting: stats[0]?.totalWaiting ?? 0,
                totalAccepted: stats[0]?.totalAccepted ?? 0,
                totalRejected: stats[0]?.totalRejected ?? 0,
                yearlyDetails: stats[0]?.yearlyDetails ?? []
            };
        } catch (error) {
            throw error;
        }
    }

    static jobHomePageStatistic = async ({ recruiterId }) => {
        try {
            const stats = await Job.aggregate([
                {
                    $match: {
                        recruiterId: new mongoose.Types.ObjectId(recruiterId),
                        acceptanceStatus: "accept",
                        status: "active",
                        deadline: { $gte: new Date() },
                    }
                },
                {
                    $group: {
                        _id: "$field",
                        totalJobByFields: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalJobs: { $sum: "$totalJobByFields" },
                        details: {
                            $push: {
                                field: "$_id",
                                totalJobs: "$totalJobByFields"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalJobs: 1,
                        details: 1
                    }
                }
            ]);
            return {
                totalJobs: stats[0]?.totalJobs ?? 0,
                details: stats[0]?.details ?? []
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RecruiterStatisticService;