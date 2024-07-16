const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    content: { type: String, required: true }
}, {
    timestamps: true
})

module.exports = {
    Report: model('Report', reportSchema)
};