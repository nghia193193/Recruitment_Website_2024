const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const recruiterPostLimitSchema = new Schema({
    recruiterId: {
        type: Schema.Types.ObjectId,
        ref: "Recruiter"
    },
    postCount: {
        type: Number,
        default: 0
    },
    lastResetDate: {
        type: Date,
        default: Date.now()
    }
}, {
    timestamps: true
})

module.exports = {
    RecruiterPostLimit: model('RecruiterPostLimit', recruiterPostLimitSchema)
};