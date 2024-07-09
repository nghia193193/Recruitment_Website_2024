const mongoose = require('mongoose');
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
    reasonDecline: String,
    oldInfo: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
})

recruiterSchema.index({ companyName: 'text', slug: 'text' }, { default_language: 'none' });

module.exports = {
    Recruiter: model('Recruiter', recruiterSchema)
};