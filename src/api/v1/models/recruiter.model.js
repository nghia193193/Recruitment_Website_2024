const mongoose = require('mongoose');
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
    roles: {
        type: Array,
        default: []
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
    companyEmail: String,
    companyPhone: String,
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
        const recruiterInfor = await this.findById(userId).lean().select(
            '-status -verifyEmail -roles -loginId -createdAt -updatedAt -__v'
        );
        return recruiterInfor;
    } catch (error) {
        throw error;
    }
}

recruiterSchema.statics.updateInformation = async function ({ userId, name, position, phone, contactEmail, companyName, companyEmail,
    companyPhone, companyWebsite, companyAddress, companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity }) {
    try {
        const result = await this.findOneAndUpdate({ _id: userId }, {
            $set: {
                name, position, phone, contactEmail, companyName, companyEmail, companyPhone, companyWebsite, companyAddress,
                companyLogo, companyCoverPhoto, about, employeeNumber, fieldOfActivity, status: 'inactive'
            }
        }, {
            new: true,
            select: { status: 0, verifyEmail: 0, roles: 0 }
        }).lean()
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