const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;
const { v2: cloudinary } = require('cloudinary');
const { Resume } = require('./resume.model');
const { InternalServerError, BadRequestError } = require('../core/error.response');

const candidateSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxLength: 50
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    phone: String,
    gender: {
        type: String,
        enum: ["Nam", "Nữ"]
    },
    avatar: {
        publicId: String,
        url: String
    },
    homeTown: String,
    workStatus: {
        type: String,
        emum: ["Đang tìm việc", "Đã có việc", "Đang tìm nơi thực tập"]
    },
    dateOfBirth: Date,
    verifyEmail: {
        type: Schema.Types.Boolean,
        default: false
    },
    loginId: {
        type: Schema.Types.ObjectId,
        ref: "Login"
    },
    allowSearch: {
        type: Schema.Types.Boolean,
        default: false
    }
}, {
    timestamps: true
})

candidateSchema.statics.verifyEmail = async function (email) {
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

candidateSchema.statics.getInformation = async function (userId) {
    try {
        const candidateInfor = await this.findById(userId).populate("loginId").lean().select(
            '-createdAt -updatedAt -__v'
        );
        if (!candidateInfor) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
        }
        const list = await Resume.find({ candidateId: userId, allowSearch: true }).lean().select("_id");
        const listAllowSearchResume = list.map(resume => resume._id);
        candidateInfor.role = candidateInfor.loginId?.role;
        delete candidateInfor.loginId;
        candidateInfor.avatar = candidateInfor.avatar?.url ?? null;
        candidateInfor.phone = candidateInfor.phone ?? null;
        candidateInfor.gender = candidateInfor.gender ?? null;
        candidateInfor.homeTown = candidateInfor.homeTown ?? null;
        candidateInfor.workStatus = candidateInfor.workStatus ?? null;
        candidateInfor.dateOfBirth = candidateInfor.dateOfBirth ?? null;
        candidateInfor.listAllowSearchResume = listAllowSearchResume;
        return candidateInfor;
    } catch (error) {
        throw error;
    }
}

candidateSchema.statics.updateInformation = async function ({ userId, name, phone, gender, homeTown, workStatus,
    dateOfBirth, allowSearch, listResume }) {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const result = await this.findOneAndUpdate({ _id: userId }, {
            $set: {
                name, phone, gender, homeTown, workStatus, dateOfBirth, allowSearch
            }
        }, {
            session,
            new: true,
            select: { createdAt: 0, updatedAt: 0, __v: 0 }
        }).lean().populate('loginId')
        if (!result) {
            throw new InternalServerError('Có lỗi xảy ra vui lòng thử lại');
        }
        if (allowSearch) {
            if (allowSearch === "true") {
                if (listResume.length !== 0) {
                    await Resume.updateMany({ candidateId: userId }, {
                        $set: {
                            allowSearch: false
                        }
                    }, {
                        session
                    })
                    for (let i = 0; i < listResume.length; i++) {
                        const result = await Resume.findByIdAndUpdate(listResume[i], {
                            $set: {
                                allowSearch: true
                            }
                        }, {
                            session,
                            new: true
                        })
                        if (!result) {
                            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
                        }
                        if (result.status !== "active") {
                            throw new BadRequestError(`Resume '${result.title}' cần được kích hoạt.`);
                        }
                    }
                }
            } else {
                await Resume.updateMany({ candidateId: userId }, {
                    $set: {
                        allowSearch: false
                    }
                }, {
                    session
                })
                listResume = [];
            }
        }
        result.role = result.loginId?.role;
        delete result.loginId;
        result.avatar = result.avatar?.url ?? null;
        result.phone = result.phone ?? null;
        result.gender = result.gender ?? null;
        result.homeTown = result.homeTown ?? null;
        result.workStatus = result.workStatus ?? null;
        result.dateOfBirth = result.dateOfBirth ?? null;
        result.listAllowSearchResume = listResume;
        await session.commitTransaction();
        session.endSession();
        return result;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}

candidateSchema.statics.updateAvatar = async function ({ userId, avatar }) {
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
        result.role = result.loginId?.role;
        delete result.loginId;
        result.avatar = result.avatar?.url ?? null;
        result.phone = result.phone ?? null;
        result.gender = result.gender ?? null;
        result.homeTown = result.homeTown ?? null;
        result.workStatus = result.workStatus ?? null;
        result.dateOfBirth = result.dateOfBirth ?? null;
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Candidate: model('Candidate', candidateSchema)
};