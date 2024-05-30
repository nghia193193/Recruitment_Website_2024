const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const { InternalServerError, BadRequestError } = require('../core/error.response');
const model = mongoose.model;
const Schema = mongoose.Schema;

const recruiterSchema = new Schema({
    avatar: {
        publicId: String,
        url: String
    },
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
    companyLogo: {
        publicId: String,
        url: String
    },
    companyCoverPhoto: {
        publicId: String,
        url: String
    },
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

recruiterSchema.statics.verifyEmail = async function (email) {
    try {
        const result = await this.findOneAndUpdate({ email }, {
            $set: {
                verifyEmail: true
            }
        }, {
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
        recruiterInfor.avatar = recruiterInfor.avatar?.url ?? null;
        recruiterInfor.companyLogo = recruiterInfor.companyLogo?.url ?? null;
        recruiterInfor.companyCoverPhoto = recruiterInfor.companyCoverPhoto?.url ?? null;
        recruiterInfor.slug = recruiterInfor.slug ?? null;
        recruiterInfor.likeNumber = likeNumber;
        recruiterInfor.reasonDecline = recruiterInfor.reasonDecline ?? null;
        return recruiterInfor;
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.updateInformation = async function ({ userId, name, position, phone, contactEmail, companyName,
    companyWebsite, companyAddress, companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug }) {
    try {
        let logo, coverPhoto;
        //upload logo
        if (companyLogo?.tempFilePath) {
            const resultLogo = await cloudinary.uploader.upload(companyLogo.tempFilePath);
            if (!resultLogo) {
                throw InternalServerError("Upload logo thất bại");
            };
            const logoPublicId = resultLogo.public_id;
            const logoUrl = cloudinary.url(logoPublicId);
            logo = {
                publicId: logoPublicId,
                url: logoUrl
            }
            //check oldLogo
            const oldLogo = (await this.findById(userId)).companyLogo?.publicId;
            if (oldLogo) {
                await cloudinary.uploader.destroy(oldLogo);
            };
        } else {
            const oldLogo = (await this.findById(userId)).companyLogo;
            if (oldLogo?.url === companyLogo) {
                logo = oldLogo
            } else {
                logo = {
                    url: companyLogo
                }
            }
        }
        //upload cover photo
        if (companyCoverPhoto?.tempFilePath) {
            const resultCoverPhoto = await cloudinary.uploader.upload(companyCoverPhoto?.tempFilePath);
            if (!resultCoverPhoto) {
                throw InternalServerError("Upload logo thất bại");
            };
            const coverPhotoPublicId = resultCoverPhoto.public_id;
            const coverPhotoUrl = cloudinary.url(coverPhotoPublicId);
            coverPhoto = {
                publicId: coverPhotoPublicId,
                url: coverPhotoUrl
            }
            const oldCoverPhoto = (await this.findById(userId)).companyCoverPhoto?.publicId;
            if (oldCoverPhoto) {
                await cloudinary.uploader.destroy(oldCoverPhoto);
            };
        } else {
            const oldCoverPhoto = (await this.findById(userId)).companyCoverPhoto;
            if (oldCoverPhoto?.url === companyCoverPhoto) {
                coverPhoto = oldCoverPhoto
            } else {
                coverPhoto = {
                    url: companyCoverPhoto
                }
            }
        }
        //check slug
        const recruiter = await this.findOne({ slug }).lean();
        if (recruiter) {
            if (recruiter._id.toString() !== userId) {
                throw new BadRequestError("Slug này đã tồn tại. Vui lòng nhập slug khác.");
            }
        }
        const result = await this.findOneAndUpdate({ _id: userId }, {
            $set: {
                name, position, phone, contactEmail, companyName, companyWebsite, companyAddress,
                about, employeeNumber, fieldOfActivity, companyLogo: logo, companyCoverPhoto: coverPhoto, slug,
                acceptanceStatus: "waiting", firstUpdate: false
            }
        }, {
            new: true,
            select: { __v: 0 }
        }).lean().populate('loginId')
        if (!result) {
            throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại');
        }
        result.role = result.loginId.role;
        delete result.loginId;
        result.avatar = result.avatar?.url ?? null;
        result.slug = result.slug ?? null;
        result.companyLogo = result.companyLogo?.url ?? null;
        result.companyCoverPhoto = result.companyCoverPhoto?.url ?? null;
        return result;
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.updateAvatar = async function ({ userId, avatar }) {
    try {
        let ava;
        //upload avatar
        if (avatar?.tempFilePath) {
            const resultAvatar = await cloudinary.uploader.upload(avatar.tempFilePath);
            if (!resultAvatar) {
                throw InternalServerError("Upload ảnh đại diện thất bại");
            };
            const avatarPublicId = resultAvatar.public_id;
            const avatarUrl = cloudinary.url(avatarPublicId);
            ava = {
                publicId: avatarPublicId,
                url: avatarUrl
            }
            //check oldAvatar
            const oldAvatar = (await this.findById(userId)).avatar?.publicId;
            if (oldAvatar) {
                await cloudinary.uploader.destroy(oldAvatar);
            };
        } else {
            const oldAvatar = (await this.findById(userId)).avatar;
            if (oldAvatar.url === avatar) {
                ava = oldAvatar
            } else {
                ava = {
                    url: avatar
                }
            }
        }
        const result = await this.findOneAndUpdate({ _id: userId }, {
            $set: {
                avatar: ava
            }
        }, {
            new: true,
            select: { __v: 0 }
        }).lean().populate('loginId')
        if (!result) {
            throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại');
        }
        result.role = result.loginId.role;
        delete result.loginId;
        result.avatar = result.avatar?.url ?? null;
        result.slug = result.slug ?? null;
        result.companyLogo = result.companyLogo?.url ?? null;
        result.companyCoverPhoto = result.companyCoverPhoto?.url ?? null;
        return result;
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.updateProfile = async function ({ userId, name, position, phone, contactEmail }) {
    try {
        const result = await this.findOneAndUpdate({ _id: userId }, {
            $set: {
                name, position, phone, contactEmail,
                acceptanceStatus: "waiting"
            }
        }, {
            new: true,
            select: { createdAt: 0, updatedAt: 0, __v: 0 }
        }).lean().populate('loginId')
        if (!result) {
            throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại');
        }
        result.role = result.loginId.role;
        delete result.loginId;
        result.avatar = result.avatar?.url ?? null;
        result.slug = result.slug ?? null;
        result.companyLogo = result.companyLogo?.url ?? null;
        result.companyCoverPhoto = result.companyCoverPhoto?.url ?? null;
        return result;
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.updateCompany = async function ({ userId, companyName, companyWebsite, companyAddress, companyLogo,
    companyCoverPhoto, about, employeeNumber, fieldOfActivity, slug }) {
    try {
        let logo, coverPhoto;
        //upload logo
        if (companyLogo) {
            if (companyLogo?.tempFilePath) {
                const resultLogo = await cloudinary.uploader.upload(companyLogo.tempFilePath);
                if (!resultLogo) {
                    throw InternalServerError("Upload logo thất bại");
                };
                const logoPublicId = resultLogo.public_id;
                const logoUrl = cloudinary.url(logoPublicId);
                logo = {
                    publicId: logoPublicId,
                    url: logoUrl
                }
                //check oldLogo
                const oldLogo = (await this.findById(userId)).companyLogo?.publicId;
                if (oldLogo) {
                    await cloudinary.uploader.destroy(oldLogo);
                };
            } else {
                const oldLogo = (await this.findById(userId)).companyLogo;
                if (oldLogo?.url === companyLogo) {
                    logo = oldLogo
                } else {
                    logo = {
                        url: companyLogo
                    }
                }
            }
        }
        //upload cover photo
        if (companyCoverPhoto) {
            if (companyCoverPhoto?.tempFilePath) {
                const resultCoverPhoto = await cloudinary.uploader.upload(companyCoverPhoto?.tempFilePath);
                if (!resultCoverPhoto) {
                    throw InternalServerError("Upload logo thất bại");
                };
                const coverPhotoPublicId = resultCoverPhoto.public_id;
                const coverPhotoUrl = cloudinary.url(coverPhotoPublicId);
                coverPhoto = {
                    publicId: coverPhotoPublicId,
                    url: coverPhotoUrl
                }
                const oldCoverPhoto = (await this.findById(userId)).companyCoverPhoto?.publicId;
                if (oldCoverPhoto) {
                    await cloudinary.uploader.destroy(oldCoverPhoto);
                };
            } else {
                const oldCoverPhoto = (await this.findById(userId)).companyCoverPhoto;
                if (oldCoverPhoto?.url === companyCoverPhoto) {
                    coverPhoto = oldCoverPhoto
                } else {
                    coverPhoto = {
                        url: companyCoverPhoto
                    }
                }
            }
        }
        //check slug
        if (slug) {
            const recruiter = await this.findOne({ slug }).lean();
            if (recruiter) {
                console.log("db: ", recruiter._id.toString());
                console.log("userId: ", userId);
                if (recruiter._id.toString() !== userId) {
                    throw new BadRequestError("Slug này đã tồn tại. Vui lòng nhập slug khác.");
                }
            }
        }
        
        const result = await this.findOneAndUpdate({ _id: userId }, {
            $set: {
                companyName, companyWebsite, companyAddress, about, employeeNumber, fieldOfActivity,
                companyLogo: logo, companyCoverPhoto: coverPhoto, slug,
                acceptanceStatus: "waiting"
            }
        }, {
            new: true,
            select: { createdAt: 0, updatedAt: 0, __v: 0 }
        }).lean().populate('loginId')
        if (!result) {
            throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại');
        }
        result.role = result.loginId.role;
        delete result.loginId;
        result.avatar = result.avatar?.url ?? null;
        result.slug = result.slug ?? null;
        result.companyLogo = result.companyLogo?.url ?? null;
        result.companyCoverPhoto = result.companyCoverPhoto?.url ?? null;
        return result;
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
                    companyLogo: recruiter.companyLogo?.url,
                    companyCoverPhoto: recruiter.companyCoverPhoto?.url
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
        result.avatar = result.avatar?.url ?? null;
        result.companyLogo = result.companyLogo?.url ?? null;
        result.companyCoverPhoto = result.companyCoverPhoto?.url ?? null;
        result.reasonDecline = result.reasonDecline ?? null;
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Recruiter: model('Recruiter', recruiterSchema)
};