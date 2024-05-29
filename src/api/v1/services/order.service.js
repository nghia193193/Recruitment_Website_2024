const { Order } = require("../models/order.model");

class OrderService {
    static createOrder = async ({ userId, price }) => {
        try {
            const result = await Order.createOrder({ userId, price });
            return result;
        } catch (error) {
            throw error;
        }
    }

    static getOrderDetail = async ({ orderId }) => {
        try {
            const result = await Order.getOrderDetail({ orderId });
            return result;
        } catch (error) {
            throw error;
        }
    }

    static updateStatus = async ({ orderId, status }) => {
        try {
            const result = await Order.updateStatus({ orderId, status });
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = OrderService;