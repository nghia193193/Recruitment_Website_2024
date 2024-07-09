const mongoose = require('mongoose');
const model = mongoose.model;
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Admin'
    },
    thumbnail: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Định hướng nghề nghiệp', 'Bí kíp tìm việc', 'Chế độ lương thưởng', 'Kiến thức chuyên ngành'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
}, {
    timestamps: true
})

blogSchema.index({ name: 'text' }, { default_language: 'none' });

module.exports = {
    Blog: model('Blog', blogSchema)
};