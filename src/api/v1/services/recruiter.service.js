const { InternalServerError, NotFoundRequestError, ConflictRequestError, BadRequestError } = require("../core/error.response");
const { Application } = require("../models/application.model");
const { Job } = require("../models/job.model");
const { Login } = require("../models/login.model");
const { Recruiter } = require("../models/recruiter.model");
const { status, levelRequirement } = require("../utils");


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
        companyWebsite, companyAddress, companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug }) => {
        try {
            const result = await Recruiter.updateInformation({
                userId, name, position, phone, contactEmail, companyName, companyEmail,
                companyWebsite, companyAddress, companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug
            })
            return {
                message: "cập nhật thông tin thành công",
                metadata: { ...result }
            }
        } catch (error) {
            throw error;
        }
    }

    static updateAvatar = async ({ userId, avatar }) => {
        try {
            const result = await Recruiter.updateAvatar({
                userId, avatar
            })
            return {
                message: "cập nhật ảnh đại diện thành công",
                metadata: { ...result }
            }
        } catch (error) {
            throw error;
        }
    }

    static updateProfile = async ({ userId, name, position, phone, contactEmail }) => {
        try {
            const result = await Recruiter.updateProfile({
                userId, name, position, phone, contactEmail
            })
            return {
                message: "cập nhật thông tin thành công",
                metadata: { ...result }
            }
        } catch (error) {
            throw error;
        }
    }

    static updateCompany = async ({ userId, companyName, companyEmail, companyWebsite, companyAddress,
        companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug }) => {
        try {
            const result = await Recruiter.updateCompany({
                userId, companyName, companyEmail, companyWebsite, companyAddress, companyLogo,
                companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug
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
            delete returnResult.__v;
            return {
                message: "Tạo công việc thành công",
                metadata: { ...returnResult }
            }
        } catch (error) {
            throw error;
        }
    }

    static updateJob = async ({ userId, jobId, name, location, province, type, levelRequirement, experience, salary,
        field, description, requirement, benefit, quantity, deadline, gender }) => {
        try {
            const job = await Job.updateJob({
                userId, jobId, name, location, province, type, levelRequirement, experience, salary,
                field, description, requirement, benefit, quantity, deadline, gender
            })
            return {
                message: "Cập nhật công việc thành công",
                metadata: { ...job }
            }
        } catch (error) {
            throw error;
        }
    }

    static getJobDetail = async ({ userId, jobId }) => {
        try {
            const job = await Job.getJobDetailByRecruiter({ userId, jobId })
            return {
                message: "Lấy thông tin công việc thành công",
                metadata: { ...job }
            }
        } catch (error) {
            throw error;
        }
    }

    static getJobStatus = async () => {
        try {
            const listStatus = status;
            return {
                message: "Lấy danh sách trạng thái công việc thành công",
                metadata: { listStatus }
            }
        } catch (error) {
            throw error;
        }
    }

    static changeJobStatus = async ({ userId, jobId, status }) => {
        try {
            const job = await Job.changeJobStatus({ userId, jobId, status })
            return {
                message: "Thay đổi trạng thái công việc thành công",
                metadata: { ...job }
            }
        } catch (error) {
            throw error;
        }
    }

    static getListWaitingJob = async ({ userId, name, field, levelRequirement, status, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { mappedList, length } = await Job.getListWaitingJobByRecruiterId({ userId, name, field, levelRequirement, status, page, limit })
            return {
                message: "Lấy danh sách công việc thành công",
                metadata: {
                    listWaitingJob: mappedList,
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
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { mappedList, length } = await Job.getListAcceptedJobByRecruiterId({ userId, name, field, levelRequirement, status, page, limit })
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

    static getListDeclinedJob = async ({ userId, name, field, levelRequirement, status, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { mappedList, length } = await Job.getListDeclinedJobByRecruiterId({ userId, name, field, levelRequirement, status, page, limit })
            return {
                message: "Lấy danh sách công việc thành công",
                metadata: {
                    listDeclinedJob: mappedList,
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

    static getListJobApplication = async ({ userId, jobId, candidateName, experience, status,
        page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const job = await Job.findById(jobId).lean();
            if (!job) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            const { listApplication, totalElement } = await Application.getListJobApplication({
                userId, jobId, candidateName, experience, status,
                page, limit
            })
            return {
                message: "Lấy danh sách ứng tuyển thành công",
                metadata: {
                    listApplication,
                    totalElement,
                    name: job.name,
                    levelRequirement: job.levelRequirement
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

    static getApplicationDetail = async ({ userId, applicationId }) => {
        try {
            const result = await Application.getApplicationDetail({ userId, applicationId });
            return {
                message: "Lấy thông tin resume thành công",
                metadata: {
                    ...result
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static approveApplication = async ({ userId, applicationId, status }) => {
        try {
            await Application.approveApplication({ userId, applicationId, status });
            return {
                message: "Duyệt đơn ứng tuyển thành công thành công",
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RecruiterService;
