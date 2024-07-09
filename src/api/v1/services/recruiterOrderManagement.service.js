const OrderService = require("./order.service");

class RecruiterOrderManageMentService {
    static viewOrder = async ({ userId }) => {
        try {
            const { packageInfo } = await OrderService.getOrderInfo({ userId });
            return {
                message: "Lấy thông tin dịch vụ thành công",
                metadata: {
                    ...packageInfo
                }
            };
        } catch (error) {
            throw error;
        }
    }

    static cancelOrder = async ({ userId, reasonCancel }) => {
        try {
            const refundAmount = await OrderService.cancelOrder({ userId, reasonCancel });
            return {
                message: "Hủy dịch vụ thành công",
                metadata: {
                    refundAmount
                }
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RecruiterOrderManageMentService;