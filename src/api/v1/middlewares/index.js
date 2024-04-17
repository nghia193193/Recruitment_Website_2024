const jwt = require('jsonwebtoken');
const { UnauthorizedRequestError, NotFoundRequestError, ForbiddenRequestError } = require('../core/error.response');
const { Recruiter } = require('../models/recruiter.model');
const { Admin } = require('../models/admin.model');

const verifyAccessToken = (req, res, next) => {
    try {
        if (!req.headers['authorization']) {
            throw new UnauthorizedRequestError("Vui lòng đăng nhập");
        }
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
            if (err) {
                // invalid error,...
                if (err.name === 'JsonWebTokenError') {
                    throw new UnauthorizedRequestError("Vui lòng đăng nhập");
                }
                // token expired error
                throw new UnauthorizedRequestError("Vui lòng đăng nhập lại");
            }
            req.payload = payload;
            next();
        })
    } catch (error) {
        next(error)
    }

}

const authPageRecruiter = async (req, res, next) => {
    try {
        const { userId } = req.payload;
        if (!userId) {
            throw new UnauthorizedRequestError("Vui lòng đăng nhập");
        }
        const recruiter = await Recruiter.findById(userId).populate('loginId');
        if (!recruiter) {
            throw new NotFoundRequestError("Không tìm thấy người dùng");
        }
        if (recruiter.loginId.role !== "RECRUITER") {
            throw new ForbiddenRequestError("Bạn không có quyền");
        }
        next();
    } catch (error) {
        next(error)
    }
}

const authPageAdmin = async (req, res, next) => {
    try {
        const { userId } = req.payload;
        if (!userId) {
            throw new UnauthorizedRequestError("Vui lòng đăng nhập");
        }
        const admin = await Admin.findById(userId).populate('loginId');
        if (!admin) {
            throw new NotFoundRequestError("Không tìm thấy người dùng");
        }
        if (admin.loginId.role !== "ADMIN") {
            throw new ForbiddenRequestError("Bạn không có quyền");
        }
        next();
    } catch (error) {
        next(error)
    }
}

module.exports = {
    verifyAccessToken,
    authPageRecruiter,
    authPageAdmin
}