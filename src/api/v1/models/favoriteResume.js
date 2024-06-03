const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const favoriteResumeSchema = new Schema({
    recruiterId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Recruiter'
    },
    favoriteResumes: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
})

module.exports = {
    FavoriteResume: model('FavoriteResume', favoriteResumeSchema)
}