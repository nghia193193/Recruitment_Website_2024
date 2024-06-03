const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const { InternalServerError, BadRequestError } = require('../core/error.response');
const model = mongoose.model;
const Schema = mongoose.Schema;

const recruiterSchema = new Schema({
    avatar: String,
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    contactEmail: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    acceptanceStatus: {
        type: String,
        enum: ["waiting", "accept", "decline"],
        default: "waiting"
    },
    firstApproval: {
        type: Schema.Types.Boolean,
        default: true
    },
    firstUpdate: {
        type: Schema.Types.Boolean,
        default: true
    },
    verifyEmail: {
        type: Schema.Types.Boolean,
        default: false
    },
    position: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true,
        maxLength: 150
    },
    companyWebsite: String,
    companyAddress: String,
    companyLogo: String,
    companyCoverPhoto: String,
    about: String,
    employeeNumber: Number,
    fieldOfActivity: {
        type: Array,
        default: []
    },
    loginId: {
        type: Schema.Types.ObjectId,
        ref: "Login"
    },
    slug: String,
    reasonDecline: String
}, {
    timestamps: true
})

recruiterSchema.index({ companyName: 'text', slug: 'text' }, { default_language: 'none' });

recruiterSchema.statics.verifyEmail = async function (email, session) {
    try {
        const result = await this.findOneAndUpdate({ email }, {
            $set: {
                verifyEmail: true
            }
        }, {
            session,
            new: true
        })
        if (!result) {
            throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại');
        }
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.getInformation = async function (userId) {
    try {
        const recruiterInfor = await this.findById(userId).populate("loginId").lean().select(
            '-createdAt -updatedAt -__v'
        );
        if (!recruiterInfor) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
        }
        const { FavoriteRecruiter } = require('./favoriteRecruiter.model');
        const likeNumber = await FavoriteRecruiter.getLikeNumber({ recruiterId: userId });
        recruiterInfor.role = recruiterInfor.loginId?.role;
        delete recruiterInfor.loginId;
        recruiterInfor.avatar = recruiterInfor.avatar ?? null;
        recruiterInfor.companyLogo = recruiterInfor.companyLogo ?? null;
        recruiterInfor.companyCoverPhoto = recruiterInfor.companyCoverPhoto ?? null;
        recruiterInfor.slug = recruiterInfor.slug ?? null;
        recruiterInfor.likeNumber = likeNumber;
        recruiterInfor.reasonDecline = recruiterInfor.reasonDecline ?? null;
        return recruiterInfor;
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.getListRecruiterByAdmin = async function ({ searchText, field, acceptanceStatus, page, limit }) {
    try {
        let query = {
            firstUpdate: false
        };
        let listRecruiter;
        if (acceptanceStatus) {
            query["acceptanceStatus"] = acceptanceStatus;
        }
        if (field) {
            query["fieldOfActivity"] = { "$in": field };
        }
        if (searchText) {
            query["$text"] = { $search: searchText };
            listRecruiter = await this.find(query, { score: { $meta: "textScore" } })
                .lean()
                .select("-createdAt -updatedAt -__v -loginId")
                .sort({ score: { $meta: "textScore" }, updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
        } else {
            listRecruiter = await this.find(query)
                .lean()
                .select("-createdAt -updatedAt -__v -loginId")
                .sort({ updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
        }
        const totalElement = await this.find(query).lean().countDocuments();
        if (listRecruiter.length !== 0) {
            listRecruiter = listRecruiter.map(recruiter => {
                return {
                    ...recruiter,
                    companyLogo: recruiter.companyLogo,
                    companyCoverPhoto: recruiter.companyCoverPhoto
                }
            })
        }
        return {
            totalElement, listRecruiter
        }
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.approveRecruiter = async function ({ recruiterId, acceptanceStatus, reasonDecline }) {
    try {
        let result;
        if (acceptanceStatus === "accept") {
            result = await this.findOneAndUpdate({ _id: recruiterId }, {
                $set: {
                    acceptanceStatus: acceptanceStatus, firstApproval: false
                }
            }, {
                new: true,
                select: { __v: 0, createdAt: 0, udatedAt: 0 }
            }).lean().populate('loginId')
        } else {
            result = await this.findOneAndUpdate({ _id: recruiterId }, {
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
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Recruiter: model('Recruiter', recruiterSchema)
};