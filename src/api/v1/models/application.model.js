const { formatInTimeZone } = require('date-fns-tz');
const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
    jobId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Job'
    },
    candidateId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Candidate'
    },
    resumeId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Resume'
    },
    status: {
        type: String,
        enum: ['Đã nộp', 'Đã nhận', 'Không nhận'],
        default: 'Đã nộp'
    },
    reasonDecline: String
}, {
    timestamps: true
})

module.exports = {
    Application: model('Application', applicationSchema)
};