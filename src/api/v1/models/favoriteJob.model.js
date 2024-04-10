const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const favoriteJobSchema = new Schema({
    jobId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Job'
    },
    candidateId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Candidate'
    }
}, {
    timestamps: true
})

module.exports = {
    FavoriteJob: model('FavoriteJob', favoriteJobSchema)
};