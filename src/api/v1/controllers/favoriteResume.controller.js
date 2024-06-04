const FavoriteResumeService = require("../services/favoriteResume.service");
const FavoriteResumeValidation = require("../validations/favoriteResume.validation");
const { OK, CREATED } = require('../core/success.response')

class FavoriteResumeController {
    getListFavoriteResume = async (req, res, next) => {
        const { error, value } = FavoriteResumeValidation.validateGetListFavoriteResume(req.query);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await FavoriteResumeService.getListFavoriteResume({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    checkFavoriteResume = async (req, res, next) => {
        const { error, value } = FavoriteResumeValidation.validateResumeId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await FavoriteResumeService.checkFavoriteResume({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    addFavoriteResume = async (req, res, next) => {
        const { error, value } = FavoriteResumeValidation.validateResumeId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message } = await FavoriteResumeService.addFavoriteResume({ ...req.payload, ...value });
        new CREATED({
            message: message,
            metadata: { ...metadata }
        }).send(res)
    }

    removeFavoriteResume = async (req, res, next) => {
        const { error, value } = FavoriteResumeValidation.validateResumeId(req.params);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }
        const { metadata, message, options } = await FavoriteResumeService.removeFavoriteResume({ ...req.payload, ...value });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }

    removeAllFavoriteResume = async (req, res, next) => {
        const { metadata, message, options } = await FavoriteResumeService.removeAllFavoriteResume({ ...req.payload });
        new OK({
            message: message,
            metadata: { ...metadata },
            options: options
        }).send(res)
    }
}

module.exports = new FavoriteResumeController();