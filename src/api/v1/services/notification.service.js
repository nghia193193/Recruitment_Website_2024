const { formatInTimeZone } = require("date-fns-tz");
const { Notification } = require("../models/notification.model");
const { InternalServerError } = require("../core/error.response");

class NotificationService {
    static getListNotification = async function ({ userId }) {
        try {
            let listNotification = await Notification.find({ receiverId: userId }).select("-__v -senderId -receiverId -senderCode -updatedAt").sort({ createdAt: -1 }).lean();
            listNotification = listNotification.map(item => {
                item.createdAt = formatInTimeZone(item.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyy HH:mm:ss");
                return item;
            })
            return listNotification;
        } catch (error) {
            throw error;
        }
    }
    
    static readNotification = async function ({ userId, notificationId }) {
        try {
            const notification = await Notification.findOneAndUpdate({ _id: notificationId, receiverId: userId }, {
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

    static removeNotification = async function ({ userId, notificationId }) {
        try {
            const result = await Notification.findOneAndDelete({ _id: notificationId, receiverId: userId });
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
        } catch (error) {
            throw error;
        }
    }

    static removeAllNotification = async function ({ userId }) {
        try {
            const result = await Notification.deleteMany({ receiverId: userId });
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = NotificationService;