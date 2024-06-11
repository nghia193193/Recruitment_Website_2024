const { Order } = require("../models/order.model");
const mongoose = require('mongoose');
const { InternalServerError, NotFoundRequestError } = require('../core/error.response');
const { formatInTimeZone } = require('date-fns-tz');

class OrderService {
    static createOrder = async ({ userId, price, premiumPackage }) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const result = await Order.create({ recruiterId: userId, orderInfo: "Upgrade Premium", price, premiumPackage });
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại");
            }
            session.commitTransaction();
            session.endSession();
            return result.toObject();
        } catch (error) {
            session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    static getOrderDetail = async ({ orderId }) => {
        try {
            const result = await Order.findById(orderId).lean();
            result.price = result.price.toLocaleString("vi-VN");
            result.validTo = result?.validTo ? formatInTimeZone(result.validTo, "Asia/Ho_Chi_Minh", "dd/MM/yyyy") : null;
            return result;
        } catch (error) {
            throw error;
        }
    }

    static updateStatus = async ({ orderId, status }) => {
        try {
            const order = await Order.findById(orderId).lean();
            const premiumPackage = order.premiumPackage;
            let validTo;
            switch (premiumPackage) {
                case "1 tháng":
                    validTo = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
                    break;
                case "3 tháng":
                    validTo = new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000);
                    break;
                case "6 tháng":
                    validTo = new Date(new Date().getTime() + 180 * 24 * 60 * 60 * 1000);
                    break;
            }
            let result = await Order.findByIdAndUpdate(orderId, {
                $set: {
                    status: status,
                    validTo
                }
            }, {
                new: true,
                select: { __v: 0, recruiterId: 0 }
            });
            if (!result) {
                throw new InternalServerError("Có lỗi xảy ra.");
            }
            result = result.toObject()
            result.price = result.price.toLocaleString("en-US");
            result.createdAt = formatInTimeZone(result.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
            result.validTo = formatInTimeZone(result.validTo, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
            return result;
        } catch (error) {
            throw error;
        }
    }

    static getOrderInfo = async ({ userId }) => {
        try {
            const order = await Order.findOne({ recruiterId: userId, status: "Thành công", validTo: { $gt: new Date() } });
            if (!order) {
                throw new NotFoundRequestError("Không tìm thấy dịch vụ.");
            }
            let refundAmount;
            let remainDate;
            switch (order.premiumPackage) {
                case "1 tháng":
                    remainDate = Math.ceil((new Date(order.validTo) - new Date()) / (1000 * 60 * 60 * 24));
                    refundAmount = 600000 * (remainDate / 30);
                    break;
                case "3 tháng":
                    remainDate = Math.ceil((new Date(order.validTo) - new Date()) / (1000 * 60 * 60 * 24));
                    refundAmount = 1500000 * (remainDate / 90);
                    break;
                case "6 tháng":
                    remainDate = Math.ceil((new Date(order.validTo) - new Date()) / (1000 * 60 * 60 * 24));
                    refundAmount = 3000000 * (remainDate / 150);
                    break;
            }
            return {
                packageInfo: {
                    validTo: formatInTimeZone(order.validTo, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss"),
                    remainDate,
                    refundAmount: refundAmount.toLocaleString("en-US")
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static cancelOrder = async ({ userId, reasonCancel }) => {
        try {
            const order = await Order.findOne({ recruiterId: userId, status: "Thành công", validTo: { $gt: new Date() } });
            if (!order) {
                throw new NotFoundRequestError("Không tìm thấy dịch vụ.");
            }
            let refundAmount;
            let remainDate;
            switch (order.premiumPackage) {
                case "1 tháng":
                    remainDate = Math.ceil((new Date(order.validTo) - new Date()) / (1000 * 60 * 60 * 24));
                    refundAmount = 600000 * (remainDate / 30);
                    break;
                case "3 tháng":
                    remainDate = Math.ceil((new Date(order.validTo) - new Date()) / (1000 * 60 * 60 * 24));
                    refundAmount = 1500000 * (remainDate / 90);
                    break;
                case "6 tháng":
                    remainDate = Math.ceil((new Date(order.validTo) - new Date()) / (1000 * 60 * 60 * 24));
                    refundAmount = 3000000 * (remainDate / 150);
                    break;
            }
            order.status = "Đã hủy";
            order.refundAmount = refundAmount;
            order.reasonCancel = reasonCancel;
            await order.save();
            return refundAmount.toLocaleString("en-US");
        } catch (error) {
            throw error;
        }
    }
}

module.exports = OrderService;