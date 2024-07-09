const mongoose = require('mongoose');
const { Recruiter } = require('./recruiter.model');
const { BadRequestError, InternalServerError } = require('../core/error.response');
const { Job } = require('./job.model');
const model = mongoose.model;
const Schema = mongoose.Schema;

const favoriteRecruiterSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Candidate'
    },
    favoriteRecruiters: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
})

module.exports = {
    FavoriteRecruiter: model('FavoriteRecruiter', favoriteRecruiterSchema)
};