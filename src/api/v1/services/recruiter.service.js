const { InternalServerError, NotFoundRequestError } = require("../core/error.response");
const { Recruiter } = require("../models/recruiter.model");


class RecruiterService {

    static getInformation = async ({ userId }) => {
        console.log(userId)
        // check Exist
        const recruiter = await Recruiter.findById(userId).lean().select('-status -verifyEmail -roles');
        console.log(recruiter)
        if (!recruiter) {
            throw new NotFoundRequestError("Không tìm thấy người dùng");
        }
        return {
            message: "Lấy thông tin thành công",
            metadata: { ...recruiter }
        }
    }

    static updateInformation = async ({ userId, name, position, phone, contactEmail, companyName, companyEmail, companyPhone,
        companyWebsite, companyAddress, companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity }) => {
        const result = await Recruiter.updateInformation({
            userId, name, position, phone, contactEmail, companyName, companyEmail, companyPhone,
            companyWebsite, companyAddress, companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity
        })
        if (!result) {
            throw new InternalServerError('Có lỗi xảy ra')
        }
        return {
            message: "cập nhật thông tin thành công",
            metadata: { ...result }
        }
    }
}

module.exports = RecruiterService;
