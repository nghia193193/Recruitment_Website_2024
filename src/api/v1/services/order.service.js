const { Order } = require("../models/order.model");
const mongoose = require('mongoose');
const { InternalServerError } = require('../core/error.response');
const { formatInTimeZone } = require('date-fns-tz');

class OrderService {
    static createOrder = async ({ userId, price }) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const result = await Order.create({ recruiterId: userId, orderInfo: "Upgrade Premium", price: price });
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
            let result = await Order.findByIdAndUpdate(orderId, {
                $set: {
                    status: status,
                    validTo: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
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
}

module.exports = OrderService;