const { CREATED, OK } = require('../core/success.response');
const { BadRequestError } = require("../core/error.response");
const { clearImage } = require("../utils/processImage");
const BlogService = require("../services/blog.service");
const AdminBlogManagementValidation = require('../validations/adminBlogManagement.validation');

class AdminBlogMangementController {
    getListBlog = async (req, res, next) => {
        const { error, value } = AdminBlogManagementValidation.validateListBlog(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await BlogService.getListBlog(value);
        new OK({
            message: message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    getBlogDetail = async (req, res, next) => {
        const { error, value } = AdminBlogManagementValidation.validateBlogId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await BlogService.getBlogDetail(value);
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    createBlog = async (req, res, next) => {
        const { error, value } = AdminBlogManagementValidation.validateCreateBlog({ ...req.body, ...req.files });
        if (error) {
            const { avatar, companyLogo, companyCoverPhoto, uploadFile } = value;
            if (uploadFile) {
                clearImage(uploadFile[0].filename);
            }
            if (avatar) {
                clearImage(avatar[0].filename);
            }
            if (companyLogo) {
                clearImage(companyLogo[0].filename);
            }
            if (companyCoverPhoto) {
                clearImage(companyCoverPhoto[0].filename);
            }
            throw new BadRequestError(error.details[0].message);
        }
        const { uploadFile } = value;
        value.uploadFile = `${process.env.DOMAIN}/images/${uploadFile[0].filename}`;
        const { metadata, message, options } = await BlogService.createBlog({ ...req.payload, ...value });
        new CREATED({
            message: message,
            metadata: { ...metadata },
            options
        }).send(res)
    }

    updateBlog = async (req, res, next) => {
        const { error, value } = AdminBlogManagementValidation.validateUpdateBlog({ ...req.body, ...req.files, ...req.params });
        if (error) {
            const { avatar, companyLogo, companyCoverPhoto, uploadFile } = value;
            if (uploadFile) {
                clearImage(uploadFile[0].filename);
            }
            if (avatar) {
                clearImage(avatar[0].filename);
            }
            if (companyLogo) {
                clearImage(companyLogo[0].filename);
            }
            if (companyCoverPhoto) {
                clearImage(companyCoverPhoto[0].filename);
            }
            throw new BadRequestError(error.details[0].message);
        }
        const { uploadFile } = value;
        if (uploadFile) {
            value.uploadFile = `${process.env.DOMAIN}/images/${uploadFile[0].filename}`;
        }
        const { metadata, message, options } = await BlogService.updateBlog(value);
        new OK({
            message: message,
            metadata: { ...metadata },
            options
        }).send(res)
    }
}

module.exports = new AdminBlogMangementController();