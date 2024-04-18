const { InternalServerError, NotFoundRequestError } = require("../core/error.response");
const { Job } = require("../models/job.model");
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
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra');
            }
            return {
                message: "cập nhật thông tin thành công",
                metadata: { ...result }
            }
        } catch (error) {
            throw error;
        }
    }

    static createJob = async ({ userId, name, location, type, levelRequirement, experience, salary,
        field, description, requirement, benefit, quantity, deadline, gender }) => {
        try {
            const result = await Job.create({
                userId, name, location, type, levelRequirement, experience, salary, field, description, 
                requirement, benefit, quantity, deadline, gender, recruiterId: userId
            })
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra');
            }
            const returnResult = result.toObject();
            delete returnResult.recruiterId;
            delete returnResult.createdAt;
            delete returnResult.updatedAt;
            delete returnResult.isApproved;
            delete returnResult.__v;
            return {
                message: "Tạo công việc thành công",
                metadata: { ...returnResult }
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RecruiterService;
