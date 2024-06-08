const mongoose = require('mongoose');
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
    premiumPackage: {
        type: String,
        enum: ["1 tháng", "3 tháng", "6 tháng"]
    },
    status: {
        type: String,
        enum: ["Đang xử lý", "Thất bại", "Thành công", "Đã hủy"],
        default: "Đang xử lý"
    },
    validTo: Date,
    refundAmount: Number
}, {
    timestamps: true
})

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