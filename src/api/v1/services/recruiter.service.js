const { InternalServerError, NotFoundRequestError, ConflictRequestError } = require("../core/error.response");
const { Job } = require("../models/job.model");
const { Login } = require("../models/login.model");
const { Recruiter } = require("../models/recruiter.model");


class RecruiterService {

    static getInformation = async ({ userId }) => {
        try {
            const recruiter = await Recruiter.getInformation(userId);
            return {
                message: "Lấy thông tin thành công",
                metadata: { ...recruiter }
            }
        } catch (error) {
            throw error;
        }
    }

    static updateInformation = async ({ userId, name, position, phone, contactEmail, companyName, companyEmail,
        companyWebsite, companyAddress, companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity }) => {
        try {
            const result = await Recruiter.updateInformation({
                userId, name, position, phone, contactEmail, companyName, companyEmail,
                companyWebsite, companyAddress, companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity
            })
            return {
                message: "cập nhật thông tin thành công",
                metadata: { ...result }
            }
        } catch (error) {
            throw error;
        }
    }

    static changePassword = async ({ userId, currentPassword, newPassword }) => {
        try {
            const email = (await Recruiter.findById(userId).lean()).email;
            const { message } = await Login.changePassword({ email, currentPassword, newPassword });
            return {
                message: message
            }
        } catch (error) {
            throw error;
        }
    }

    static createJob = async ({ userId, name, location, province, type, levelRequirement, experience, salary,
        field, description, requirement, benefit, quantity, deadline, gender }) => {
        try {
            //check exist 
            const isExist = await Job.findOne({ name, recruiterId: userId });
            if (isExist) {
                throw new ConflictRequestError("Tên công việc đã được sử dụng");
            }
            const result = await Job.create({
                userId, name, location, province, type, levelRequirement, experience, salary, field, description,
                requirement, benefit, quantity, deadline, gender, recruiterId: userId
            })
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra');
            }
            const returnResult = result.toObject();
            delete returnResult.recruiterId;
            delete returnResult.createdAt;
            delete returnResult.updatedAt;
            delete returnResult.acceptanceStatus;
            delete returnResult.__v;
            return {
                message: "Tạo công việc thành công",
                metadata: { ...returnResult }
            }
        } catch (error) {
            throw error;
        }
    }

    static getListWaitingJob = async ({ userId, name, field, levelRequirement, status, page, limit }) => {
        try {
            const { result, length } = await Job.getListWaitingJobByRecruiterId({ userId, name, field, levelRequirement, status, page, limit })
            return {
                message: "Lấy danh sách công việc thành công",
                metadata: {
                    listWaitingJob: result,
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

    static getListAcceptedJob = async ({ userId, name, field, levelRequirement, status, page, limit }) => {
        try {
            const { result, length } = await Job.getListAcceptedJobByRecruiterId({ userId, name, field, levelRequirement, status, page, limit })
            return {
                message: "Lấy danh sách công việc thành công",
                metadata: {
                    listAcceptedJob: result,
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

    static getListDeclinedJob = async ({ userId, name, field, levelRequirement, status, page, limit }) => {
        try {
            const { result, length } = await Job.getListDeclinedJobByRecruiterId({ userId, name, field, levelRequirement, status, page, limit })
            return {
                message: "Lấy danh sách công việc thành công",
                metadata: {
                    listDeclinedJob: result,
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

module.exports = RecruiterService;
