const mongoose = require('mongoose'); // Erase if already required

var adminSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId
    },
    phone: String,
    avatar: String,
    name: String,
    email: String,
    loginId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Login"
    }
}, {
    timestamps: true
})

adminSchema.statics.getInformation = async function ({ userId }) {
    try {
        const adminInfor = await this.findById(userId).populate("loginId").lean().select(
            '-createdAt -updatedAt -__v'
        );
        adminInfor.role = adminInfor.loginId?.role;
        adminInfor.loginId = undefined;
        return adminInfor;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Admin: mongoose.model('Admin', adminSchema)
};