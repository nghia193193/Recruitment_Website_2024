const { BadRequestError, InternalServerError, NotFoundRequestError } = require('../core/error.response');
const { Recruiter } = require('../models/recruiter.model');
const { createTransporter } = require('../utils/sendMails');
const { Login } = require('../models/login.model');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const { clearImage } = require('../utils/processImage');
const RecruiterService = require('./recruiter.service');
const { RecruiterPostLimit } = require('../models/recruiterPostLimit.model');

class AdminRecruiterManagementService {
    static getListRecruiterByAdmin = async function ({ searchText, field, acceptanceStatus, page, limit }) {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            let query = {
                firstUpdate: false,
                isBan: false
            };
            let listRecruiter;
            if (acceptanceStatus) query["acceptanceStatus"] = acceptanceStatus;
            if (field) query["fieldOfActivity"] = { "$in": [field] };
            const pipeline = [
                {
                    $lookup: {
                        from: 'orders',
                        let: { recruiterId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$recruiterId', '$$recruiterId'] }, // id từ order, recruiter
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
                        premiumAccount: { $gt: [{ $size: '$premiumDetails' }, 0] }, // > 0 thì true
                    }
                },
                { $sort: { premiumAccount: -1, updatedAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
                {
                    $project: {
                        __v: 0,
                        loginId: 0,
                        avatar: 0,
                        premiumDetails: 0
                    }
                }
            ]
            if (searchText) {
                query["$text"] = { $search: searchText };
                listRecruiter = await Recruiter.aggregate([
                    { $match: query },
                    ...pipeline
                ])
            } else {
                listRecruiter = await Recruiter.aggregate([
                    { $match: query },
                    ...pipeline
                ])
            }
            const totalElement = await Recruiter.find(query).lean().countDocuments();
            return {
                message: "Lấy danh sách nhà tuyển dụng thành công",
                metadata: {
                    totalElement, listRecruiter
                },
                options: {
                    page, limit
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static getListAllRecruiter = async function ({ searchText, acceptanceStatus }) {
        try {
            let query = {
                firstUpdate: false
            };
            let listRecruiter;
            if (acceptanceStatus) query["acceptanceStatus"] = acceptanceStatus;
            const pipeline = [
                {
                    $project: {
                        __v: 0,
                        loginId: 0,
                        avatar: 0
                    }
                },
                { $sort: { name: -1 } }
            ]
            if (searchText) {
                query["$text"] = { $search: searchText };
                listRecruiter = await Recruiter.aggregate([
                    { $match: query },
                    ...pipeline
                ])
            } else {
                listRecruiter = await Recruiter.aggregate([
                    { $match: query },
                    ...pipeline
                ])
            }
            const totalElement = await Recruiter.find(query).lean().countDocuments();
            return {
                message: "Lấy danh sách nhà tuyển dụng thành công",
                metadata: {
                    totalElement, listRecruiter
                }
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
            const hashPassword = await bcrypt.hash(password, 10);
            const login = await Login.create([{
                email, password: hashPassword, role: "RECRUITER"
            }], session)
            if (!login) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            const result = await Recruiter.create([{
                name, position, phone, contactEmail, companyName, companyWebsite, companyAddress,
                companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug, email,
                acceptanceStatus: "accept", firstApproval: false, firstUpdate: false, verifyEmail: true,
                loginId: login[0]._id
            }], { session })
            if (!result) {
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
            const { message, metadata } = await RecruiterService.getInformation({ userId: recruiterId });
            return {
                message,
                metadata
            }
        } catch (error) {
            throw error;
        }

    }

    // Duyệt nhà tuyển dụng
    static approveRecruiter = async ({ recruiterId, acceptanceStatus, reasonDecline }) => {
        try {
            const recruiter = await Recruiter.findById(recruiterId).lean();
            if (!recruiter) {
                throw new NotFoundRequestError("Có lỗi xảy ra vui lòng thử lại.");
            }
            let result;
            if (acceptanceStatus === "accept") {
                if (recruiter.oldInfo) {
                    const { companyLogo, companyCoverPhoto } = recruiter.oldInfo;
                    if (companyLogo) {
                        if (companyLogo !== recruiter.companyLogo) {
                            const splitArr = companyLogo.split("/");
                            const image = splitArr[splitArr.length - 1];
                            clearImage(image);
                        }
                    }
                    if (companyCoverPhoto) {
                        if (companyCoverPhoto !== recruiter.companyCoverPhoto) {
                            const splitArr = companyCoverPhoto.split("/");
                            const image = splitArr[splitArr.length - 1];
                            clearImage(image);
                        }
                    }
                }
                result = await Recruiter.findOneAndUpdate({ _id: recruiterId }, {
                    $set: {
                        acceptanceStatus: acceptanceStatus, reasonDecline: null, firstApproval: false, oldInfo: {}
                    }
                }, {
                    new: true,
                    select: { __v: 0, createdAt: 0, udatedAt: 0 }
                }).populate('loginId').lean()

                // Tạo limit post cho nhà tuyển dụng nếu chưa có
                const isExist = await RecruiterPostLimit.findOne({ recruiterId }).lean();
                if (!isExist) {
                    await RecruiterPostLimit.create({ recruiterId });
                }
            } else {
                result = await Recruiter.findOneAndUpdate({ _id: recruiterId }, {
                    $set: {
                        acceptanceStatus: acceptanceStatus, reasonDecline
                    }
                }, {
                    new: true,
                    select: { __v: 0, createdAt: 0, udatedAt: 0 }
                }).populate('loginId').lean()
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

    // Lấy thông tin nhà tuyển dụng bị cấm
    static getListBannedRecruiter = async function ({ searchText, field, page, limit }) {
        try {
            page = page ? +page : 1;
            limit = limit ? +limit : 5;
            let query = {
                isBan: true
            };
            let listRecruiter;
            if (field) query["fieldOfActivity"] = { "$in": [field] };
            const pipeline = [
                {
                    $project: {
                        __v: 0,
                        loginId: 0,
                        avatar: 0
                    }
                },
                { $sort: { updatedAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit }
            ]
            if (searchText) {
                query["$text"] = { $search: searchText };
                listRecruiter = await Recruiter.aggregate([
                    { $match: query },
                    ...pipeline
                ])
            } else {
                listRecruiter = await Recruiter.aggregate([
                    { $match: query },
                    ...pipeline
                ])
            }
            const totalElement = await Recruiter.find(query).lean().countDocuments();
            return {
                totalElement, listRecruiter, page, limit
            }
        } catch (error) {
            throw error;
        }
    }

    // Mở khóa nhà tuyển dụng
    static unbanRecruiter = async ({ recruiterId }) => {
        try {
            const result = await Recruiter.findByIdAndUpdate(recruiterId, {
                $set: {
                    isBan: false
                }
            }).lean();
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminRecruiterManagementService;