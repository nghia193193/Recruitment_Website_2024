const { BadRequestError, InternalServerError } = require('../core/error.response');
const { Admin } = require('../models/admin.model');
const { Job } = require('../models/job.model');
const { Notification } = require('../models/notification.model');
const { Recruiter } = require('../models/recruiter.model');
const { FavoriteRecruiter } = require('../models/favoriteRecruiter.model');
const { acceptanceStatus, mapRolePermission } = require('../utils');
const { createTransporter } = require('../utils/sendMails');
const { Login } = require('../models/login.model');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const { clearImage } = require('../utils/processImage');
const { formatInTimeZone } = require('date-fns-tz');
const RecruiterService = require('./recruiter.service');

class AdminService {

    static getInformation = async ({ userId }) => {
        try {
            const adminInfor = await Admin.findById(userId).populate("loginId").lean().select(
                '-createdAt -updatedAt -__v'
            );
            adminInfor.role = adminInfor.loginId?.role;
            delete adminInfor.loginId;
            return {
                message: "Lấy thông tin thành công",
                metadata: { ...adminInfor },
            }
        } catch (error) {
            throw error;
        }
    }

    static createRecruiter = async ({ name, position, phone, contactEmail, companyName, companyWebsite, companyAddress,
        companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug, email, password }) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            //check slug
            const recruiter = await Recruiter.findOne({ slug }).lean();
            if (recruiter) {
                throw new BadRequestError("Slug này đã tồn tại. Vui lòng nhập slug khác.");
            }
            const result = await Recruiter.create([{
                name, position, phone, contactEmail, companyName, companyWebsite, companyAddress,
                companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug, email,
                acceptanceStatus: "accept", firstApproval: false, firstUpdate: false, verifyEmail: true
            }], { session })
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            const hashPassword = await bcrypt.hash(password, 10);
            const login = await Login.create([{
                email, password: hashPassword, role: "RECRUITER"
            }], session)
            if (!login) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            await session.commitTransaction();
            session.endSession();
            return {
                message: "Tạo nhà tuyển dụng thành công"
            }
        } catch (error) {
            if (companyLogo) {
                const splitArr = companyLogo.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            if (companyCoverPhoto) {
                const splitArr = companyCoverPhoto.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    static updateRecruiter = async ({ recruiterId, name, position, phone, contactEmail, companyName, companyWebsite,
        companyAddress, companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug, acceptanceStatus,
        reasonDecline }) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            //check slug
            if (slug) {
                const recruiter = await Recruiter.findOne({ slug }).lean();
                if (recruiter._id.toString() !== recruiterId) {
                    throw new BadRequestError("Slug này đã tồn tại. Vui lòng nhập slug khác.");
                }
            }
            let result;
            if (acceptanceStatus === "accept") {
                result = await Recruiter.findByIdAndUpdate(recruiterId, {
                    $set: {
                        name, position, phone, contactEmail, companyName, companyWebsite, companyAddress, companyLogo,
                        companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug, acceptanceStatus, reasonDecline: null,
                    }
                }, {
                    session,
                    new: true,
                    select: { __v: 0, loginId: 0 }
                }).lean();
            } else {
                result = await Recruiter.findByIdAndUpdate(recruiterId, {
                    $set: {
                        name, position, phone, contactEmail, companyName, companyWebsite, companyAddress, companyLogo,
                        companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug, acceptanceStatus, reasonDecline
                    }
                }, {
                    session,
                    new: true,
                    select: { __v: 0, loginId: 0 }
                }).lean();
            }
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            await session.commitTransaction();
            session.endSession();
            return {
                message: "Cập nhật nhà tuyển dụng thành công",
                metadata: {
                    ...result
                }
            }
        } catch (error) {
            if (companyLogo) {
                const splitArr = companyLogo.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            if (companyCoverPhoto) {
                const splitArr = companyCoverPhoto.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    static getRecruiterInformation = async ({ recruiterId }) => {
        try {
            const recruiter = await RecruiterService.getInformation(recruiterId);
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
            let result;
            if (acceptanceStatus === "accept") {
                result = await Recruiter.findOneAndUpdate({ _id: recruiterId }, {
                    $set: {
                        acceptanceStatus: acceptanceStatus, firstApproval: false
                    }
                }, {
                    new: true,
                    select: { __v: 0, createdAt: 0, udatedAt: 0 }
                }).lean().populate('loginId')
            } else {
                result = await Recruiter.findOneAndUpdate({ _id: recruiterId }, {
                    $set: {
                        acceptanceStatus: acceptanceStatus, reasonDecline, firstApproval: false
                    }
                }, {
                    new: true,
                    select: { __v: 0, createdAt: 0, udatedAt: 0 }
                }).lean().populate('loginId')
            }
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            result.role = result.loginId.role;
            delete result.loginId;
            result.avatar = result.avatar ?? null;
            result.companyLogo = result.companyLogo ?? null;
            result.companyCoverPhoto = result.companyCoverPhoto ?? null;
            result.reasonDecline = result.reasonDecline ?? null;
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

    static createJob = async ({ recruiterId, name, location, province, type, levelRequirement, experience, salary,
        field, description, requirement, benefit, quantity, deadline, gender }) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const recruiter = await Recruiter.findById(recruiterId).lean();
            if (!recruiter) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại.');
            }
            const result = await Job.create([{
                name, location, province, type, levelRequirement, experience, salary, field, description,
                requirement, benefit, quantity, deadline, gender, recruiterId, acceptanceStatus: "accept",
                status: "active", approvalDate: new Date()
            }], { session })
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại.');
            }
            // thông báo tới ứng viên yêu thích nhà tuyển dụng
            const listCandidate = await FavoriteRecruiter.find({ favoriteRecruiters: recruiterId.toString() }).lean();
            if (listCandidate.length !== 0) {
                for (let i = 0; i < listCandidate.length; i++) {
                    const notificationCandidate = await Notification.create([{
                        senderId: recruiterId,
                        receiverId: listCandidate[i].candidateId,
                        senderCode: mapRolePermission["RECRUITER"],
                        link: `${process.env.FE_URL}/jobs/${result[0]._id.toString()}`,
                        title: "Nhà tuyển dụng đã đăng việc làm mới.",
                        content: `${recruiter.companyName} vừa đăng tải tin tuyển dụng mới. Vào xem ngay!`
                    }], { session })
                    if (!notificationCandidate) {
                        throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
                    }
                    _io.emit(`notification_candidate_${listCandidate[i].candidateId}`, notificationCandidate);
                }
            }
            await session.commitTransaction();
            session.endSession();
            return {
                message: "Tạo công việc thành công"
            }
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    static updateJob = async ({ jobId, name, location, province, type, levelRequirement, experience, salary,
        field, description, requirement, benefit, quantity, deadline, gender, acceptanceStatus, reasonDecline }) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            let result;
            if (acceptanceStatus === "accept") {
                result = await Job.findByIdAndUpdate(jobId, {
                    $set: {
                        name, location, province, type, levelRequirement, experience, salary, field, description,
                        requirement, benefit, quantity, deadline, gender, acceptanceStatus, reasonDecline: null,
                        approvalDate: new Date()
                    }
                }, {
                    session,
                    new: true,
                    select: { __v: 0, recruiterId: 0 }
                }).lean()
            } else {
                result = await Job.findByIdAndUpdate(jobId, {
                    $set: {
                        name, location, province, type, levelRequirement, experience, salary, field, description,
                        requirement, benefit, quantity, deadline, gender, acceptanceStatus, reasonDecline,
                        approvalDate: new Date()
                    }
                }, {
                    session,
                    new: true,
                    select: { __v: 0, recruiterId: 0 }
                }).lean()
            }
            if (!result) {
                throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại.');
            }
            await session.commitTransaction();
            session.endSession();
            return {
                message: "Cập nhật công việc thành công",
                metadata: {
                    ...result
                }
            }
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    static approveJob = async ({ userId, jobId, acceptanceStatus, reasonDecline }) => {
        try {
            let job;
            if (acceptanceStatus === "accept") {
                job = await Job.findOneAndUpdate({ _id: jobId }, {
                    $set: {
                        acceptanceStatus: acceptanceStatus,
                        approvalDate: formatInTimeZone(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
                        reasonDecline: null
                    }
                }, {
                    new: true,
                    select: { __v: 0 }
                }).lean().populate("recruiterId")
            } else {
                job = await Job.findOneAndUpdate({ _id: jobId }, {
                    $set: {
                        acceptanceStatus: acceptanceStatus,
                        approvalDate: formatInTimeZone(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
                        reasonDecline
                    }
                }, {
                    new: true,
                    select: { __v: 0 }
                }).lean().populate("recruiterId")
            }
            if (!job) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            const recruiterId = job.recruiterId._id;
            job.deadline = formatInTimeZone(job.deadline, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
            job.createdAt = formatInTimeZone(job.createdAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.updatedAt = formatInTimeZone(job.updatedAt, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.approvalDate = formatInTimeZone(job.approvalDate, "Asia/Ho_Chi_Minh", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            job.companyName = job.recruiterId.companyName ?? null;
            const companyName = job.companyName;
            job.companyLogo = job.recruiterId.companyLogo ?? null;
            job.employeeNumber = job.recruiterId.employeeNumber;
            job.companyAddress = job.recruiterId.companyAddress;
            job.reasonDecline = job.reasonDecline ?? null;
            delete job.recruiterId;
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