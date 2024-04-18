const { InternalServerError, NotFoundRequestError } = require("../core/error.response");
const { Recruiter } = require("../models/recruiter.model");


class RecruiterService {

    static getInformation = async ({ userId }) => {
        try {
            // check Exist
            const recruiter = await Recruiter.getInformation(userId);
            if (!recruiter) {
                throw new NotFoundRequestError("Không tìm thấy người dùng");
            }
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
}

module.exports = RecruiterService;
