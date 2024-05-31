const { NotFoundRequestError, BadRequestError, InternalServerError } = require('../core/error.response');
const { Admin } = require('../models/admin.model');
const { Job } = require('../models/job.model');
const { Notification } = require('../models/notification.model');
const { Recruiter } = require('../models/recruiter.model');
const { FavoriteRecruiter } = require('../models/favoriteRecruiter.model');
const { acceptanceStatus, mapRolePermission } = require('../utils');
const { createTransporter } = require('../utils/sendMails');
const JobService = require('./job.service');

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

    static getListRecruiter = async ({ name, acceptanceStatus, page, limit }) => {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            const { totalElement, listRecruiter } = await Recruiter.getListRecruiterByAdmin({ name, acceptanceStatus, page, limit });
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

    static getRecruiterInformation = async ({ recruiterId }) => {
        try {
            const recruiter = await Recruiter.getInformation(recruiterId);
            return {
                message: "Lấy thông tin nhà tuyển dụng thành công",
                metadata: { ...recruiter }
            }
        } catch (error) {
            throw error;
        }

    }

    static approveRecruiter = async ({ recruiterId, acceptanceStatus, reasonDecline }) => {
        try {
            const result = await Recruiter.approveRecruiter({ recruiterId, acceptanceStatus, reasonDecline });
            let mailDetails;
            if (result.acceptanceStatus === "accept") {
                mailDetails = {
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
                }
            } else {
                mailDetails = {
                    from: `${process.env.MAIL_SEND}`,
                    to: result.email,
                    subject: 'Tài khoản của bạn đã được duyệt',
                    html: ` 
                    <div style="text-align: left; font-family: arial; margin: 10px auto;"> 
                        <span style="margin: 5px 2px"><b>Xin chào</b> <b style="color: red">${result.name}</b>,</span>        
                        <p style="margin: 5px 2px">Tài khoản của bạn không được chấp thuận để sử dụng các dịch vụ. Vui lòng kiểm tra, cập nhật lại thông tin hoặc liên hệ với chúng tôi qua email <b>${process.env.MAIL_SEND}</b> để được giải quyết.</p>
                        <p style="margin: 5px 2px">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
                        <p style="margin: 20px 2px">Trân trọng.</p>
                    </div>
                    `
                }
            }
            // send mail
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

    static getListAcceptanceStatus = async () => {
        try {
            return {
                message: "Lấy danh sách trạng thái thành công",
                metadata: { listAcceptanceStatus: acceptanceStatus },
            }
        } catch (error) {
            throw error;
        }
    }

    static approveJob = async ({ userId, jobId, acceptanceStatus, reasonDecline }) => {
        try {
            const { job, recruiterId, companyName } = await Job.approveJob({ jobId, acceptanceStatus, reasonDecline });
            // thông báo tới nhà tuyển dụng
            const notification = await Notification.create({
                senderId: userId,
                receiverId: recruiterId,
                senderCode: mapRolePermission["ADMIN"],
                link: `${process.env.FE_URL}/recruiter/profile/jobsPosted`,
                title: "Quản trị viên đã duyệt công việc do bạn tạo.",
                content: `Công việc '${job.name}' ${acceptanceStatus === "accept" ? "đã được chấp thuận" : "đã bị từ chối"}`
            })
            if (!notification) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            // thông báo tới ứng viên yêu thích nhà tuyển dụng
            if (acceptanceStatus === "accept") {
                const listCandidate = await FavoriteRecruiter.find({ favoriteRecruiters: recruiterId.toString() }).lean();
                if (listCandidate.length !== 0) {
                    for (let i = 0; i < listCandidate.length; i++) {
                        const notificationCandidate = await Notification.create({
                            senderId: recruiterId,
                            receiverId: listCandidate[i].candidateId,
                            senderCode: mapRolePermission["RECRUITER"],
                            link: `${process.env.FE_URL}/jobs/${jobId}`,
                            title: "Nhà tuyển dụng đã đăng việc làm mới.",
                            content: `${companyName} vừa đăng tải tin tuyển dụng mới. Vào xem ngay!`
                        })
                        if (!notificationCandidate) {
                            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
                        }
                        _io.emit(`notification_candidate_${listCandidate[i].candidateId}`, notificationCandidate);
                    }
                }
            }
            _io.emit(`notification_recruiter_${userId}`, notification);
            return {
                message: "Duyệt công việc thành công",
                metadata: { ...job },
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminService;