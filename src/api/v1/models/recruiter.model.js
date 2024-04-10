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
        defaut: 'inactive'
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
    fieldOfActivity: String
}, {
    timestamps: true
})

recruiterSchema.statics.verifyEmail = async function(email) {
    try {
        const result = await this.findOneAndUpdate({email}, {
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

module.exports = {
    Recruiter: model('Recruiter', recruiterSchema)
};