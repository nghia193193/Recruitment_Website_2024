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

module.exports = {
    Admin: mongoose.model('Admin', adminSchema)
};