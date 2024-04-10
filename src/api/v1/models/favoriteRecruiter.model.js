const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const favoriteRecruiterSchema = new Schema({
    recruiterId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Company'
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
    FavoriteRecruiter: model('FavoriteRecruiter', favoriteRecruiterSchema)
};