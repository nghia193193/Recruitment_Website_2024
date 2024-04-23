const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const notificationAdminRecruiterSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    recruiterId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isRead: {
        type: Schema.Types.Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = {
    NotificationAdminRecruiter: model('NotificationAdminRecruiter', notificationAdminRecruiterSchema)
};