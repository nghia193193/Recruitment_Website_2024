const { formatInTimeZone } = require("date-fns-tz");
const { Application } = require("../models/application.model");
const { Job } = require("../models/job.model");
const { Order } = require("../models/order.model");

class JobService {
    static getListJob = async ({ name, province, type, levelRequirement, experience, field,
        genderRequirement, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            // query
            const query = {
                status: "active",
                acceptanceStatus: "accept",
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
                query["$text"] = { $search: name };
                result = await Job.find(query, { score: { $meta: "textScore" } }).lean().populate("recruiterId")
                    .select("name field type levelRequirement experience salary province approvalDate deadline recruiterId createdAt updatedAt")
                    .sort({ score: { $meta: "textScore" }, approvalDate: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
            } else {
                result = await Job.find(query).lean().populate("recruiterId")
                    .select("name field type levelRequirement experience salary province approvalDate deadline recruiterId createdAt updatedAt")
                    .sort({ approvalDate: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
            }
            const length = await Job.find(query).lean().countDocuments();
            // format data
            let mappedJobs = await Promise.all(
                result.map(async (job) => {
                    job.premiumAccount = await Order.checkPremiumAccount({ recruiterId: job.recruiterId._id.toString() });
                    job.companyName = job.recruiterId.companyName ?? null;
                    job.companyLogo = job.recruiterId.companyLogo?.url ?? null;
                    job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                    job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                    job.approvalDate = job.approvalDate ? formatInTimeZone(job.approvalDate, "Asia/Ho_Chi_Minh", "dd/MM/yyyy") : null;
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

    static getJobDetail = async ({ jobId }) => {
        try {
            let job = await Job.findById(jobId).lean().populate("recruiterId")
                .select("-__v -reasonDecline")
            if (!job) {
                throw new NotFoundRequestError("Không tìm thấy công việc");
            }
            // format data
            const acceptedNumber = await Application.getJobAcceptedApplicationNumber({ jobId });
            job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
            job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.approvalDate = job.approvalDate ? formatInTimeZone(job.approvalDate, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX") : undefined;
            job.companyName = job.recruiterId.companyName ?? null;
            job.companySlug = job.recruiterId.slug ?? null;
            job.companyLogo = job.recruiterId.companyLogo?.url ?? null;
            job.employeeNumber = job.recruiterId.employeeNumber;
            job.companyAddress = job.recruiterId.companyAddress;
            job.acceptedNumber = acceptedNumber;
            delete job.recruiterId;

            return {
                message: "Lấy thông tin công việc thành công",
                metadata: { ...job }
            }
        } catch (error) {
            throw error;
        }
    }

    static getListJobOfRecruiter = async ({ slug, name, province, type, levelRequirement, experience, field,
        genderRequirement, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            // query
            const matchStage = {
                "recruiters.slug": slug,
                "status": "active",
                "acceptanceStatus": "accept",
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
                    "acceptanceStatus": 1,
                    "approvalDate": 1,
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
                job.companyLogo = job.recruiters[0].companyLogo?.url ?? null;
                job.employeeNumber = job.recruiters[0].employeeNumber;
                job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                job.approvalDate = job.approvalDate ? formatInTimeZone(job.approvalDate, "Asia/Ho_Chi_Minh", "dd/MM/yyyy") : null;
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
                acceptanceStatus: "accept",
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
                .select("name field type levelRequirement experience salary province approvalDate deadline recruiterId createdAt updatedAt")
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ updatedAt: -1 })
            // format data
            result = result.map(job => {
                job.companyName = job.recruiterId.companyName ?? null;
                job.companyLogo = job.recruiterId.companyLogo?.url ?? null;
                job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                job.approvalDate = job.approvalDate ? formatInTimeZone(job.approvalDate, "Asia/Ho_Chi_Minh", "dd/MM/yyyy") : null;
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
}

module.exports = JobService;