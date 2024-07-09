const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");
const BlogService = require("../services/blog.service");
const BlogValidation = require("../validations/blog.validation");

class BlogController {
    getListBlog = async (req, res, next) => {
        const { error, value } = BlogValidation.validateListBlog(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await BlogService.getListBlog(value);
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getListRelatedBlog = async (req, res, next) => {
        const { error, value } = BlogValidation.validateListRelatedBlog({ ...req.query, ...req.params });
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata, options } = await BlogService.getListRelatedBlog(value);
        new OK({
            message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getBlogDetail = async (req, res, next) => {
        const { error, value } = BlogValidation.validateBlogId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { message, metadata } = await BlogService.getBlogDetail(value);
        new OK({
            message,
            metadata: { ...metadata }
        }).send(res)
    }
}

module.exports = new BlogController();