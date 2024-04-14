const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const loginSchema = new Schema({
    email: String,
    password: String,
    role: String
}, {
    timestamps: true
})

module.exports = {
    Login: model('Login', loginSchema)
};