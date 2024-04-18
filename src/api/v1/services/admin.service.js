const { NotFoundRequestError, BadRequestError } = require('../core/error.response');
const { Admin } = require('../models/admin.model');
const { Recruiter } = require('../models/recruiter.model');
const { createTransporter } = require('../utils/sendMails');

class AdminService {

    static getInformation = async ({ userId }) => {
        try {
            const admin = await Admin.getInformation({ userId });
            return {
                message: "Lấy thông tin thành công",
                metadata: { ...admin },
            }
        } catch (error) {
            throw error;
        }
    }

    static getListRecruiter = async ({ name, status, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { totalElement, listRecruiter } = await Recruiter.getListRecruiter({ name, status, page, limit });
            return {
                message: "Lấy danh sách nhà tuyển dụng thành công",
                metadata: { listRecruiter, totalElement },
                options: {
                    page: page,
                    limit: limit
                }
            }
        } catch (error) {
            throw error;
        }

    }

    static approveRecruiter = async ({ recruiterId }) => {
        try {
            // activate recruiter
            const result = await Recruiter.approveRecruiter({ recruiterId });
            if (!result) {
                throw new NotFoundRequestError("Không tìm thấy nhà tuyển dụng");
            }
            // send mail
            let mailDetails = {
                from: `${process.env.MAIL_SEND}`,
                to: result.email,
                subject: 'Tài khoản của bạn đã được duyệt',
                html: ` 
                <div style="text-align: left; font-family: arial; margin: 10px auto;"> 
                    <span style="margin: 5px 2px"><b>Xin chào</b> <b style="color: red">${result.name}</b>,</span>        
                    <p style="margin: 5px 2px">Tài khoản của bạn đã được chấp thuận để sử dụng các dịch vụ.</p>
                    <p style="margin: 5px 2px">Chúc bạn có những trải nghiệm tuyệt vời ở trang web của chúng tôi.</p>
                    <p style="margin: 5px 2px">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
                    <p style="margin: 20px 2px">Trân trọng.</p>
                </div>
                `
            };
            const transporter = await createTransporter();
            transporter.sendMail(mailDetails, err => {
                throw new InternalServerError('Có lỗi xảy ra');
            });
            return {
                message: "Duyệt nhà tuyển dụng thành công",
                metadata: { ...result },
            }
        } catch (error) {
            throw error;
        }
    }

    static changeRecruiterStatus = async ({ recruiterId, status }) => {
        try {
            const result = await Recruiter.changeRecruiterStatus({ recruiterId, status });
            if (!result) {
                throw new NotFoundRequestError("Không tìm thấy nhà tuyển dụng");
            }
            return {
                message: "Thay đổi trạng thái thành công",
                metadata: { ...result },
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminService;