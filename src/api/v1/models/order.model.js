const mongoose = require('mongoose');
const { InternalServerError } = require('../core/error.response');
const { formatInTimeZone } = require('date-fns-tz');
const model = mongoose.model;
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    recruiterId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Recruiter'
    },
    orderInfo: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Đang xử lý", "Thất bại", "Thành công"],
        default: "Đang xử lý"
    },
    validTo: Date
}, {
    timestamps: true
})

orderSchema.statics.createOrder = async function ({ userId, price }) {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const result = await this.create({ recruiterId: userId, orderInfo: "Upgrade Premium", price: price });
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

orderSchema.statics.getOrderDetail = async function ({ orderId }) {
    try {
        const result = await this.findById(orderId).lean();
        result.price = result.price.toLocaleString("vi-VN");
        result.validTo = result?.validTo ? formatInTimeZone(result.validTo, "Asia/Ho_Chi_Minh", "dd/MM/yyyy") : null;
        return result;
    } catch (error) {
        throw error;
    }
}

orderSchema.statics.updateStatus = async function ({ orderId, status }) {
    try {
        let result = await this.findByIdAndUpdate(orderId, {
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

orderSchema.statics.checkPremiumAccount = async function ({ recruiterId }) {
    try {
        const order = await this.findOne({ recruiterId, status: "Thành công", validTo: { $gt: new Date() } });
        const premiumAccount = order ? true : false;
        return premiumAccount;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Order: model('Order', orderSchema)
};