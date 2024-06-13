const { Blog } = require("../models/blog.model");
const { BadRequestError, InternalServerError, NotFoundRequestError } = require("../core/error.response");
const { clearImage } = require("../utils/processImage");
const { formatInTimeZone } = require("date-fns-tz");

class BlogService {
    static getListBlog = async ({ name, type, status, page, limit }) => {
        try {
            page = page ? page : 1;
            limit = limit ? limit : 5;
            const query = {
                status: "active"
            };
            if (name) query['$text'] = { $search: `"${name}"` };
            if (type) query['type'] = type;
            if (status) query['status'] = status;
            const totalElement = await Blog.find(query).countDocuments()
            let listBlog = await Blog.find(query).select('-adminId -__v').lean()
                .sort({ updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
            listBlog = listBlog.map(blog => {
                blog.createdAt = formatInTimeZone(blog.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
                blog.updatedAt = formatInTimeZone(blog.updatedAt, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
                return blog;
            })
            return {
                message: "Lấy danh sách blog thành công",
                metadata: {
                    totalElement, listBlog
                },
                options: { page, limit }
            };
        } catch (error) {
            throw error;
        }
    }

    static getListRelatedBlog = async ({ blogId, name, page, limit }) => {
        try {
            page = page ? page : 1;
            limit = limit ? limit : 5;
            const blog = await Blog.findById(blogId).lean();
            if (!blog) {
                throw new NotFoundRequestError("Có lỗi xảy ra vui lòng thử lại.");
            }
            const query = {
                _id: { $ne: blogId },
                status: "active",
                type: blog.type
            };
            if (name) query['$text'] = { $search: name };
            const totalElement = await Blog.find(query).countDocuments()
            let listBlog = await Blog.find(query).select('-adminId -__v').lean()
                .sort({ updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
            listBlog = listBlog.map(blog => {
                blog.createdAt = formatInTimeZone(blog.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
                blog.updatedAt = formatInTimeZone(blog.updatedAt, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
                return blog;
            })
            return {
                message: "Lấy danh sách blog liên quan thành công",
                metadata: {
                    totalElement, listBlog
                },
                options: { page, limit }
            };
        } catch (error) {
            throw error;
        }
    }

    static getBlogDetail = async ({ blogId }) => {
        try {
            const blog = await Blog.findById(blogId).select('-adminId -__v').lean();
            if (!blog) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            blog.createdAt = formatInTimeZone(blog.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
            blog.updatedAt = formatInTimeZone(blog.updatedAt, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
            return {
                message: "Lấy thông tin blog thành công",
                metadata: {
                    ...blog
                }
            };
        } catch (error) {
            throw error;
        }
    }

    static createBlog = async ({ userId, uploadFile, name, type, content }) => {
        try {
            // check name exist
            const isExist = await Blog.findOne({ name }).lean();
            if (isExist) {
                throw new BadRequestError("Tên blog này đã được sử dụng.")
            }
            const blog = await Blog.create({
                adminId: userId, thumbnail: uploadFile, name, type, content
            })
            if (!blog) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            return {
                message: "Tạo blog thành công",
                metadata: {}
            }
        } catch (error) {
            if (uploadFile) {
                const splitArr = uploadFile.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            throw error;
        }
    }

    static updateBlog = async ({ blogId, uploadFile, name, type, content, status }) => {
        try {
            // check name exist
            if (name) {
                const isExist = await Blog.findOne({ name }).lean();
                if (isExist) {
                    if (isExist._id.toString() !== blogId) {
                        throw new BadRequestError("Tên blog này đã được sử dụng.")
                    }
                }
            }
            const oldBlog = await Blog.findById(blogId);
            if (!oldBlog) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            if (uploadFile) {
                const splitArr = oldBlog.thumbnail.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            const blog = await Blog.findByIdAndUpdate(blogId, {
                thumbnail: uploadFile, name, type, content, status
            }, {
                new: true,
                select: { adminId: 0, __v: 0 }
            }).lean();
            blog.createdAt = formatInTimeZone(blog.createdAt, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
            blog.updatedAt = formatInTimeZone(blog.updatedAt, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
            if (!blog) {
                throw new InternalServerError("Có lỗi xảy ra vui lòng thử lại.");
            }
            return {
                message: "Cập nhật blog thành công",
                metadata: { ...blog }
            }
        } catch (error) {
            if (uploadFile) {
                const splitArr = uploadFile.split("/");
                const image = splitArr[splitArr.length - 1];
                clearImage(image);
            }
            throw error;
        }
    }
}

module.exports = BlogService;