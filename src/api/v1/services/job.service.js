const { formatInTimeZone } = require("date-fns-tz");
const { Job } = require("../models/job.model");
const { Order } = require("../models/order.model");
const ApplicationService = require("./application.service");
const { NotFoundRequestError } = require("../core/error.response");

class JobService {
    // Lấy danh sách công việc
    static getListJob = async ({ name, province, type, levelRequirement, experience, field,
        genderRequirement, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            // query
            const query = {
                status: "active",
                deadline: { $gte: Date.now() }
            };
            let result;
            if (province) {
                query["province"] = province;
            }
            if (type) {
                query["type"] = type;
            }
            if (experience) {
                query["experience"] = experience;
            }
            if (field) {
                query["field"] = field;
            }
            if (levelRequirement) {
                query["levelRequirement"] = levelRequirement;
            }
            if (genderRequirement) {
                query["genderRequirement"] = genderRequirement;
            }
            if (name) {
                query["$text"] = { $search: `"${name}"` };
                result = await Job.find(query, { score: { $meta: "textScore" } }).lean().populate("recruiterId")
                    .select("name field type levelRequirement experience salary province deadline recruiterId createdAt updatedAt")
                    .sort({ score: { $meta: "textScore" }, updatedAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
            } else {
                result = await Job.find(query).lean().populate("recruiterId")
                    .select("name field type levelRequirement experience salary province deadline recruiterId createdAt updatedAt")
                    .sort({ updatedAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
            }
            const length = await Job.find(query).lean().countDocuments();
            // format data
            let mappedJobs = await Promise.all(
                result.map(async (job) => {
                    job.premiumAccount = await Order.checkPremiumAccount({ recruiterId: job.recruiterId._id.toString() });
                    job.companyName = job.recruiterId.companyName ?? null;
                    job.companyLogo = job.recruiterId.companyLogo ?? null;
                    job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                    job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                    job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
                    delete job.recruiterId;
                    return { ...job };
                })
            )
            return {
                message: "Lấy danh sách công việc thành công",
                metadata: {
                    listJob: mappedJobs,
                    totalElement: length
                },
                options: {
                    page: page,
                    limit: limit
                }
            }
        } catch (error) {
            throw error;
        }
    }

    // Lấy thông tin chi tiết công việc
    static getJobDetail = async ({ jobId }) => {
        try {
            let job = await Job.findById(jobId).lean().populate("recruiterId")
                .select("-__v")
            if (!job) {
                throw new NotFoundRequestError("Không tìm thấy công việc");
            }
            // format data
            const acceptedNumber = await ApplicationService.getJobAcceptedApplicationNumber({ jobId });
            job.quantity = job.quantity === 'o' ? "Không giới hạn" : job.quantity;
            job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
            job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.companyName = job.recruiterId.companyName ?? null;
            job.companySlug = job.recruiterId.slug ?? null;
            job.companyLogo = job.recruiterId.companyLogo ?? null;
            job.employeeNumber = job.recruiterId.employeeNumber;
            job.companyAddress = job.recruiterId.companyAddress;
            job.acceptedNumber = acceptedNumber;
            job.recruiterId = job.recruiterId._id.toString();

            return {
                message: "Lấy thông tin công việc thành công",
                metadata: { ...job }
            }
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách công việc của nhà tuyển dụng theo slug
    static getListJobOfRecruiter = async ({ slug, name, province, type, levelRequirement, experience, field,
        genderRequirement, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            // query
            const matchStage = {
                "recruiters.slug": slug,
                "status": "active",
                "deadline": { $gte: new Date() }
            }
            if (province) matchStage.province = province;
            if (type) matchStage.type = type;
            if (experience) matchStage.experience = experience;
            if (field) matchStage.field = field;
            if (levelRequirement) matchStage.levelRequirement = levelRequirement;
            if (genderRequirement) matchStage.genderRequirement = genderRequirement;

            const pipeline = [];
            if (name) {
                pipeline.push({
                    $match: {
                        $text: { $search: name }
                    }
                });
            }
            pipeline.push({
                $lookup: {
                    from: "recruiters",
                    localField: "recruiterId",
                    foreignField: "_id",
                    as: "recruiters"
                }
            })
            pipeline.push({
                $match: matchStage
            });
            pipeline.push({
                $project: {
                    "_id": 1,
                    "name": 1,
                    "type": 1,
                    "salary": 1,
                    "province": 1,
                    "levelRequirement": 1,
                    "genderRequirement": 1,
                    "experience": 1,
                    "field": 1,
                    "deadline": 1,
                    "recruiters.companyName": 1,
                    "recruiters.slug": 1,
                    "recruiters.employeeNumber": 1,
                    "recruiters.companyLogo": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            })
            const totalDocument = await Job.aggregate([...pipeline, { $count: "totalDocuments" }]);
            const length = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
            let result = await Job.aggregate(
                [...pipeline, {
                    $sort: {
                        "updatedAt": -1
                    }
                },
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: limit
                }]
            );
            // format data
            result = result.map(job => {
                job.companySlug = job.recruiters[0].slug ?? null;
                job.companyName = job.recruiters[0].companyName ?? null;
                job.companyLogo = job.recruiters[0].companyLogo ?? null;
                job.employeeNumber = job.recruiters[0].employeeNumber;
                job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
                delete job.recruiters;
                return { ...job };
            })

            return {
                message: "Lấy danh sách công việc thành công",
                metadata: {
                    listJob: result,
                    totalElement: length
                },
                options: {
                    page: page,
                    limit: limit
                }
            }
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách công việc liên quan theo lĩnh vực
    static getListRelatedJobByField = async ({ jobId, name, province, type, levelRequirement, experience,
        genderRequirement, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            // query
            const job = await Job.findById(jobId).lean();
            if (!job) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            const field = job.field;
            const query = {
                _id: { $ne: jobId },
                status: "active",
                deadline: { $gte: Date.now() },
                field: field
            };
            if (name) {
                query["$text"] = { $search: name };
            }
            if (province) {
                query["province"] = province;
            }
            if (type) {
                query["type"] = type;
            }
            if (experience) {
                query["experience"] = experience;
            }
            if (levelRequirement) {
                query["levelRequirement"] = levelRequirement;
            }
            if (genderRequirement) {
                query["genderRequirement"] = genderRequirement;
            }
            const length = await Job.find(query).lean().countDocuments();
            let result = await Job.find(query).lean().populate("recruiterId")
                .select("name field type levelRequirement experience salary province deadline recruiterId createdAt updatedAt")
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ updatedAt: -1 })
            // format data
            result = result.map(job => {
                job.companyName = job.recruiterId.companyName ?? null;
                job.companyLogo = job.recruiterId.companyLogo ?? null;
                job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
                delete job.recruiterId;
                return { ...job };
            })

            return {
                message: "Lấy danh sách công việc liên quan thành công",
                metadata: {
                    listJob: result,
                    totalElement: length
                },
                options: {
                    page: page,
                    limit: limit
                }
            }
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách công việc ưu tiên tài khoản premium
    static getListJobPremiumPrivilege = async ({ companyName, name, field, levelRequirement, page, limit }) => {
        try {
            page = page ? page : 1;
            limit = limit ? limit : 5;
            const match = {
                status: "active",
                deadline: { $gte: new Date() }
            };
            if (name) {
                match["$text"] = { $search: name };
            }
            const query = {};
            if (companyName) {
                query["recruiters.companyName"] = new RegExp(companyName, "i");
            }
            if (field) {
                query["field"] = field;
            }
            if (levelRequirement) {
                query["levelRequirement"] = levelRequirement;
            }

            const commonPipeline = [
                {
                    $lookup: {
                        from: 'orders',
                        let: { recruiterId: '$recruiterId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$recruiterId', '$$recruiterId'] },
                                            { $eq: ['$status', 'Thành công'] },
                                            { $gt: ['$validTo', new Date()] }
                                        ]
                                    }
                                }
                            },
                            { $project: { _id: 1 } }
                        ],
                        as: 'premiumDetails'
                    }
                },
                {
                    $addFields: {
                        premiumAccount: { $gt: [{ $size: '$premiumDetails' }, 0] }
                    }
                },
                {
                    $lookup: {
                        from: "recruiters",
                        localField: "recruiterId",
                        foreignField: "_id",
                        as: "recruiters"
                    }
                },
                {
                    $match: query
                },
                {
                    $project: {
                        "_id": 1,
                        "name": 1,
                        "type": 1,
                        "salary": 1,
                        "province": 1,
                        "levelRequirement": 1,
                        "field": 1,
                        "deadline": 1,
                        "recruiters.companyName": 1,
                        "recruiters.slug": 1,
                        "recruiters.employeeNumber": 1,
                        "recruiters.companyLogo": 1,
                        "premiumAccount": 1,
                        "updatedAt": 1,
                    }
                }
            ];

            const totalDocumentPipeline = [
                { $match: match },
                ...commonPipeline,
                { $count: "totalDocuments" }
            ];
            const resultPipeline = [
                { $match: match },
                ...commonPipeline,
                {
                    $sort: {
                        "premiumAccount": -1,
                        "updatedAt": -1
                    }
                },
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: limit
                }
            ];

            const totalDocument = await Job.aggregate(totalDocumentPipeline);
            const length = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
            let result = await Job.aggregate(resultPipeline);
            result = result.map(job => {
                job.companySlug = job.recruiters[0].slug ?? null;
                job.companyName = job.recruiters[0].companyName ?? null;
                job.companyLogo = job.recruiters[0].companyLogo ?? null;
                job.employeeNumber = job.recruiters[0].employeeNumber;
                job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
                delete job.recruiters;
                return { ...job };
            })
            return {
                message: "Lấy danh sách công việc thành công",
                metadata: { listJob: result, totalElement: length },
                options: {
                    page: page,
                    limit: limit
                }
            }
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách công việc nổi bật trang chủ
    static getListJobPremiumPrivilegeHome = async ({ name, province, type, levelRequirement, experience, field,
        genderRequirement, page, limit }) => {
        try {
            page = page ? page : 1;
            limit = limit ? limit : 5;
            const match = {
                status: "active",
                deadline: { $gte: new Date() }
            };
            if (name) {
                match["$text"] = { $search: name };
            }
            if (province) {
                match["province"] = province;
            }
            if (type) {
                match["type"] = type;
            }
            if (experience) {
                match["experience"] = experience;
            }
            if (field) {
                match["field"] = field;
            }
            if (levelRequirement) {
                match["levelRequirement"] = levelRequirement;
            }
            if (genderRequirement) {
                match["genderRequirement"] = genderRequirement;
            }

            const commonPipeline = [
                {
                    $lookup: {
                        from: 'orders',
                        let: { recruiterId: '$recruiterId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$recruiterId', '$$recruiterId'] },
                                            { $eq: ['$status', 'Thành công'] },
                                            { $gt: ['$validTo', new Date()] }
                                        ]
                                    }
                                }
                            },
                            { $project: { _id: 1 } }
                        ],
                        as: 'premiumDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'favoritejobs',
                        let: { jobId: { $toString: '$_id' } },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$$jobId', '$favoriteJobs']
                                    }
                                }
                            },
                            { $count: 'likeNumber' }
                        ],
                        as: 'likeDetails'
                    }
                },
                {
                    $addFields: {
                        premiumAccount: { $gt: [{ $size: '$premiumDetails' }, 0] },
                        likeNumber: { $ifNull: [{ $arrayElemAt: ['$likeDetails.likeNumber', 0] }, 0] }
                    }
                },
                {
                    $lookup: {
                        from: "recruiters",
                        localField: "recruiterId",
                        foreignField: "_id",
                        as: "recruiters"
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "name": 1,
                        "type": 1,
                        "salary": 1,
                        "province": 1,
                        "levelRequirement": 1,
                        "field": 1,
                        "deadline": 1,
                        "recruiters.companyName": 1,
                        "recruiters.slug": 1,
                        "recruiters.employeeNumber": 1,
                        "recruiters.companyLogo": 1,
                        "premiumAccount": 1,
                        "likeNumber": 1,
                        "updatedAt": 1,
                    }
                }
            ];

            const totalDocumentPipeline = [
                { $match: match },
                ...commonPipeline,
                { $count: "totalDocuments" }
            ];
            const resultPipeline = [
                { $match: match },
                ...commonPipeline,
                {
                    $sort: {
                        "premiumAccount": -1,
                        "likeNumber": -1,
                        "updatedAt": -1
                    }
                },
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: limit
                }
            ];

            const totalDocument = await Job.aggregate(totalDocumentPipeline);
            const length = totalDocument.length > 0 ? totalDocument[0].totalDocuments : 0;
            let result = await Job.aggregate(resultPipeline);
            result = result.map(job => {
                job.companySlug = job.recruiters[0].slug ?? null;
                job.companyName = job.recruiters[0].companyName ?? null;
                job.companyLogo = job.recruiters[0].companyLogo ?? null;
                job.employeeNumber = job.recruiters[0].employeeNumber;
                job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
                delete job.recruiters;
                return { ...job };
            })
            return {
                message: "Lấy danh sách công việc nổi bật thành công",
                metadata: { listJob: result, totalElement: length },
                options: {
                    page: page,
                    limit: limit
                }
            }
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách công việc của nhà tuyển dụng
    static getListJobOfRecruiterById = async function ({ userId, name, field, levelRequirement, status, page, limit }) {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const query = {
                recruiterId: userId,
                deadline: { $gte: Date.now() }
            }
            if (name) {
                query["$text"] = { $search: name };
            }
            if (field) {
                query["field"] = field;
            }
            if (levelRequirement) {
                query["levelRequirement"] = levelRequirement;
            }
            if (status) {
                query["status"] = status;
            }
            const length = await Job.find(query).lean().countDocuments();
            const result = await Job.find(query).lean()
                .select("name field type levelRequirement status deadline")
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ updatedAt: -1 })
            let mappedList = await Promise.all(
                result.map(async (item) => {
                    const applicationNumber = await ApplicationService.getJobApplicationNumber({ jobId: item._id });
                    return {
                        ...item,
                        applicationNumber: applicationNumber
                    }
                })
            )
            return {
                message: "Lấy danh sách công việc thành công",
                metadata: {
                    listAcceptedJob: mappedList,
                    totalElement: length
                },
                options: {
                    page: page,
                    limit: limit
                }
            }
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách công việc sắp hết hạn
    static getListNearingExpirationdJobByRecruiter = async function ({ userId, name, field, levelRequirement, status, page, limit }) {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const now = Date.now();
            const oneWeekFromNow = now + 7 * 24 * 60 * 60 * 1000;
            const query = {
                recruiterId: userId,
                deadline: { $gte: now, $lte: oneWeekFromNow }
            }
            if (name) {
                query["$text"] = { $search: name };
            }
            if (field) {
                query["field"] = field;
            }
            if (levelRequirement) {
                query["levelRequirement"] = levelRequirement;
            }
            if (status) {
                query["status"] = status;
            }
            const length = await Job.find(query).lean().countDocuments();
            let result = await Job.find(query).lean()
                .select("name field type levelRequirement status deadline")
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ updatedAt: -1 })
            let mappedList = await Promise.all(
                result.map(async (item) => {
                    const applicationNumber = await ApplicationService.getJobApplicationNumber({ jobId: item._id });
                    return {
                        ...item,
                        applicationNumber: applicationNumber
                    }
                })
            )
            return {
                message: "Lấy danh sách công việc sắp hết hạn thành công",
                metadata: {
                    listNearingExpirationJob: mappedList,
                    totalElement: length
                },
                options: {
                    page: page,
                    limit: limit
                }
            }
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách công việc đã hết hạn
    static getListExpiredJobByRecruiter = async function ({ userId, name, field, levelRequirement, status, page, limit }) {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const query = {
                recruiterId: userId,
                deadline: { $lt: Date.now() }
            }
            if (name) {
                query["$text"] = { $search: name };
            }
            if (field) {
                query["field"] = field;
            }
            if (levelRequirement) {
                query["levelRequirement"] = levelRequirement;
            }
            if (status) {
                query["status"] = status;
            }
            const length = await Job.find(query).lean().countDocuments();
            let result = await Job.find(query).lean()
                .select("name field type levelRequirement status deadline")
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ updatedAt: -1 })
            let mappedList = await Promise.all(
                result.map(async (item) => {
                    const applicationNumber = await ApplicationService.getJobApplicationNumber({ jobId: item._id });
                    return {
                        ...item,
                        applicationNumber: applicationNumber
                    }
                })
            )
            return {
                message: "Lấy danh sách công việc đã hết hạn thành công",
                metadata: {
                    listExpiredJob: mappedList,
                    totalElement: length
                },
                options: {
                    page: page,
                    limit: limit
                }
            }
        } catch (error) {
            throw error;
        }
    }

    // Lấy thông tin chi tiết công việc bằng nhà tuyển dụng
    static getJobDetailByRecruiter = async function ({ jobId }) {
        try {
            let job = await Job.findOne({ _id: jobId }).lean()
                .select("-__v -recruiterId")
            if (!job) {
                throw new NotFoundRequestError("Không tìm thấy công việc");
            }
            job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            return {
                message: "Lấy thông tin công việc thành công",
                metadata: { ...job }
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = JobService;