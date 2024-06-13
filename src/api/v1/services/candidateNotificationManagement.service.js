const NotificationService = require("./notification.service");

class CandidateNotificationManagementService {
    static getListNotification = async ({ userId }) => {
        try {
            const listNotification = await NotificationService.getListNotification({ userId })
            return {
                message: "Lấy danh sách thông báo thành công",
                metadata: { listNotification }
            }
        } catch (error) {
            throw error;
        }
    }

    static readNotification = async ({ userId, notificationId }) => {
        try {
            await NotificationService.readNotification({ userId, notificationId })
            return {
                message: "Đọc thông báo thành công"
            }
        } catch (error) {
            throw error;
        }
    }

    static removeNotification = async ({ userId, notificationId }) => {
        try {
            await NotificationService.removeNotification({ userId, notificationId })
            return {
                message: "Xóa thông báo thành công"
            }
        } catch (error) {
            throw error;
        }
    }

    static removeAllNotification = async ({ userId }) => {
        try {
            await NotificationService.removeAllNotification({ userId })
            return {
                message: "Xóa tất cả thông báo thành công"
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CandidateNotificationManagementService;