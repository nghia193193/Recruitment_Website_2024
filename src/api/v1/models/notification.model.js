const { formatInTimeZone } = require('date-fns-tz');
const mongoose = require('mongoose');
const { InternalServerError } = require('../core/error.response');
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
    title: {
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
        let listNotification = await this.find({ receiverId: userId }).lean().select("-__v -senderId -receiverId -senderCode -updatedAt").sort({ updatedAt: -1 });
        listNotification = listNotification.map(item => {
            item.createdAt = formatInTimeZone(item.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
            return item;
        })
        return listNotification;
    } catch (error) {
        throw error;
    }
}

notificationSchema.statics.readNotification = async function ({ userId, notificationId }) {
    try {
        const notification = await this.findOneAndUpdate({ _id: notificationId, receiverId: userId }, {
            $set: {
                isRead: true
            }
        }, {
            new: true
        })
        if (!notification) {
            throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Notification: model('Notification', notificationSchema)
};