const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const { InternalServerError } = require('../core/error.response');
const model = mongoose.model;
const Schema = mongoose.Schema;

const recruiterSchema = new Schema({
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
    companyPhone: String,
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
        return result ? 1 : 0;
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.getInformation = async function (userId) {
    try {
        const recruiterInfor = await this.findById(userId).populate("loginId").lean().select(
            '-verifyEmail -roles -createdAt -updatedAt -__v'
        );
        recruiterInfor.role = recruiterInfor.loginId?.role;
        recruiterInfor.loginId = undefined;
        recruiterInfor.companyLogo = recruiterInfor.companyLogo?.url;
        recruiterInfor.companyCoverPhoto = recruiterInfor.companyCoverPhoto?.url;
        return recruiterInfor;
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.updateInformation = async function ({ userId, name, position, phone, contactEmail, companyName,
    companyPhone, companyWebsite, companyAddress, companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity }) {
    try {
        let logo, coverPhoto;
        if (companyLogo) {
            //upload logo
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
        }

        if (companyCoverPhoto) {
            const resultCoverPhoto = await cloudinary.uploader.upload(companyCoverPhoto.tempFilePath);
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
        }

        const result = await this.findOneAndUpdate({ _id: userId }, {
            $set: {
                name, position, phone, contactEmail, companyName, companyPhone, companyWebsite, companyAddress,
                about, employeeNumber, fieldOfActivity,
                companyLogo: logo,
                companyCoverPhoto: coverPhoto
            }
        }, {
            new: true,
            select: { status: 0, verifyEmail: 0, roles: 0, loginId: 0, createdAt: 0, updatedAt: 0, __v: 0 }
        }).lean()
        result.companyLogo = result.companyLogo?.url;
        result.companyCoverPhoto = result.companyCoverPhoto?.url;
        return result ?? null;
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.getRecruiterByStatus = async function (status) {
    try {
        const listRecruiter = await this.find({ status: status }).lean();
        return listRecruiter;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Recruiter: model('Recruiter', recruiterSchema)
};