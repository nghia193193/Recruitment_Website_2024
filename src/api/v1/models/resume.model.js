const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const resumeSchema = new Schema({
    name: {
        type: String,
        trim: true,
        reuired: true
    },
    title: {
        type: String,
        trim: true,
        required: true
    },
    avatar: {
        type: String,
        trim: true,
        required: true
    },
    goal: {
        type: String,
        trim: true,
        required: true
    },
    phone: {
        type: String,
        trim: true,
        required: true
    },
    educationLevel: {
        type: String,
        trim: true,
        required: true
    },
    homeTown: {
        type: String,
        trim: true,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    english: {
        type: String,
        trim: true,
        required: true
    },
    jobType: {
        type: String,
        trim: true,
        required: true
    },
    GPA: {
        type: Number,
        required: true
    },
    activity: {
        type: String,
        trim: true,
        required: true
    },
}, {
    timestamps: true
})

module.exports = {
    Resume: model('Resume', resumeSchema)
};