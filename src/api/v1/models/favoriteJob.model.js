const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const favoriteJobSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Candidate'
    },
    favoriteJobs: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
})

module.exports = {
    FavoriteJob: model('FavoriteJob', favoriteJobSchema)
};