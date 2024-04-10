const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const loginSchema = new Schema({
    email: String,
    password: String,
    role: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: function() {
            if (this.role === "ADMIN") return "Admin";
            if (this.role === "RECRUITER") return "Recruiter";
            if (this.role === "CANDIDATE") return "Candidate";
        }
    }
}, {
    timestamps: true
})

module.exports = {
    Login: model('Login', loginSchema)
};