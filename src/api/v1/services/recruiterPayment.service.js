const OrderService = require("./order.service");
const VNPayService = require("./vnpay.service");

class RecruiterPaymentService {
    static createPayment = async ({ userId, premiumPackage, ipAddr, orderType, language }) => {
        try {
            let price;
            switch (premiumPackage) {
                case "1 tháng":
                    price = 600000;
                    break;
                case "3 tháng":
                    price = 1500000;
                    break;
                case "6 tháng":
                    price = 3000000;
                    break;
            }
            const order = await OrderService.createOrder({ userId, price, premiumPackage });
            const vpnUrl = await VNPayService.createPaymentURL({ ipAddr, orderId: order._id.toString(), amount: price, orderType, language });
            return {
                message: "Tạo đơn thanh toán thành công",
                metadata: { vpnUrl }
            };
        } catch (error) {
            throw error;
        }
    }

    static getVNPayIPN = async ({ reqQuery }) => {
        try {
            const { message, code, result } = await VNPayService.getVNPayIPN({ reqQuery });
            return {
                message,
                metadata: { code, result }
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RecruiterPaymentService;