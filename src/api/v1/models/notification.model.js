const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    senderCode: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    link: String,
    isRead: {
        type: Schema.Types.Boolean,
        default: false
    }
}, {
    timestamps: true
})

notificationSchema.statics.getListNotification = async function ({ userId }) {
    try {
        const listNotification = await this.find({ receiverId: userId }).lean().select("-__v").sort({ updatedAt: -1 });
        return listNotification;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Notification: model('Notification', notificationSchema)
};