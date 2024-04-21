const mongoose = require('mongoose');
const { BadRequestError, NotFoundRequestError } = require('../core/error.response');
const bcrypt = require('bcryptjs');
const model = mongoose.model;
const Schema = mongoose.Schema;

const loginSchema = new Schema({
    email: String,
    password: String,
    role: String
}, {
    timestamps: true
})

loginSchema.statics.changePassword = async function ({ email, currentPassword, newPassword }) {
    try {
        const userLogin = await this.findOne({ email });
        if (!userLogin) {
            throw new NotFoundRequestError("Email không tồn tại");
        }
        const match = await bcrypt.compare(currentPassword, userLogin.password);
        if (!match) {
            throw new BadRequestError("Mật khẩu hiện tại không chính xác");
        }
        const newHashPassword = await bcrypt.hash(newPassword, 10);
        userLogin.password = newHashPassword;
        await userLogin.save();
        return {
            message: "Đổi mật khẩu thành công vui lòng đăng nhập lại"
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Login: model('Login', loginSchema)
};