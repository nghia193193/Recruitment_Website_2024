const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const { InternalServerError } = require('../core/error.response');
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
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
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
    }
}, {
    timestamps: true
})

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
            '-roles -createdAt -updatedAt -__v'
        );
        recruiterInfor.role = recruiterInfor.loginId?.role;
        delete recruiterInfor.loginId;
        recruiterInfor.avatar = recruiterInfor.avatar?.url;
        recruiterInfor.companyLogo = recruiterInfor.companyLogo?.url;
        recruiterInfor.companyCoverPhoto = recruiterInfor.companyCoverPhoto?.url;
        return recruiterInfor;
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.updateInformation = async function ({ userId, name, position, phone, contactEmail, companyName,
    companyWebsite, companyAddress, companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity }) {
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
            const oldLogo = (await this.findById(userId)).companyLogo?.publicId;
            if (oldLogo) {
                await cloudinary.uploader.destroy(oldLogo);
            };
            logo = {
                url: companyLogo
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
            const oldCoverPhoto = (await this.findById(userId)).companyCoverPhoto?.publicId;
            if (oldCoverPhoto) {
                await cloudinary.uploader.destroy(oldCoverPhoto);
            };
            coverPhoto = {
                url: companyCoverPhoto
            }
        }
        const result = await this.findOneAndUpdate({ _id: userId }, {
            $set: {
                name, position, phone, contactEmail, companyName, companyWebsite, companyAddress,
                about, employeeNumber, fieldOfActivity, companyLogo: logo, companyCoverPhoto: coverPhoto,
                status: "inactive"
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
        result.companyLogo = result.companyLogo?.url;
        result.companyCoverPhoto = result.companyCoverPhoto?.url;
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
            const oldAvatar = (await this.findById(userId)).companyAvatar?.publicId;
            if (oldAvatar) {
                await cloudinary.uploader.destroy(oldAvatar);
            };
            ava = {
                url: avatar
            }
        }
        const result = await this.findOneAndUpdate({ _id: userId }, {
            $set: {
                avatar: ava
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
        result.avatar = result.avatar?.url;
        result.companyLogo = result.companyLogo?.url;
        result.companyCoverPhoto = result.companyCoverPhoto?.url;
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
                status: "inactive"
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
        result.avatar = result.avatar?.url;
        result.companyLogo = result.companyLogo?.url;
        result.companyCoverPhoto = result.companyCoverPhoto?.url;
        return result;
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.updateCompany = async function ({ userId, companyName, companyWebsite, companyAddress, companyLogo, 
    companyCoverPhoto, about, employeeNumber, fieldOfActivity }) {
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
            const oldLogo = (await this.findById(userId)).companyLogo?.publicId;
            if (oldLogo) {
                await cloudinary.uploader.destroy(oldLogo);
            };
            logo = companyLogo ? {
                url: companyLogo
            } : undefined
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
            const oldCoverPhoto = (await this.findById(userId)).companyCoverPhoto?.publicId;
            if (oldCoverPhoto) {
                await cloudinary.uploader.destroy(oldCoverPhoto);
            };
            coverPhoto = companyCoverPhoto ? {
                url: companyCoverPhoto
            } : undefined
        }
        const result = await this.findOneAndUpdate({ _id: userId }, {
            $set: {
                companyName, companyWebsite, companyAddress, about, employeeNumber, fieldOfActivity, 
                companyLogo: logo, companyCoverPhoto: coverPhoto,
                status: "inactive"
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
        result.avatar = result.avatar?.url;
        result.companyLogo = result.companyLogo?.url;
        result.companyCoverPhoto = result.companyCoverPhoto?.url;
        return result;
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.getListRecruiter = async function ({ name, status, page, limit }) {
    try {
        let query = {};
        if (status) {
            query["status"] = status;
        }
        if (name) {
            query["name"] = new RegExp(name, "i");
        }
        const totalElement = await this.find(query).lean().countDocuments();
        let listRecruiter = await this.find(query).lean().select("-createdAt -updatedAt -__v -loginId").skip((page - 1) * limit).limit(limit);
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

recruiterSchema.statics.approveRecruiter = async function ({ recruiterId }) {
    try {
        const result = await this.findOneAndUpdate({ _id: recruiterId }, {
            $set: {
                status: "active"
            }
        }, {
            new: true,
            select: { __v: 0, createdAt: 0, udatedAt: 0, loginId: 0 }
        }).lean()
        if (!result) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
        }
        result.companyLogo = result.companyLogo?.url;
        result.companyCoverPhoto = result.companyCoverPhoto?.url;
        return result;
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.changeRecruiterStatus = async function ({ recruiterId, status }) {
    try {
        const result = await this.findOneAndUpdate({ _id: recruiterId }, {
            $set: {
                status: status
            }
        }, {
            new: true,
            select: { __v: 0, createdAt: 0, udatedAt: 0, loginId: 0 }
        }).lean()
        if (!result) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
        }
        result.companyLogo = result.companyLogo?.url;
        result.companyCoverPhoto = result.companyCoverPhoto?.url;
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Recruiter: model('Recruiter', recruiterSchema)
};