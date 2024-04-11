const jwt = require('jsonwebtoken');
const client = require('../dbs/init.redis');
const { UnauthorizedRequestError } = require('../core/error.response');

class JWTService {

    static signAccessToken = async (userId) => {
        return new Promise((resole, reject) => {
            const payload = {
                userId
            }
            const secretKey = process.env.JWT_SECRET_KEY;
            const options = {
                expiresIn: '1h'
            }
            jwt.sign(payload, secretKey, options, (err, token) => {
                if (err) reject(err);
                resole(token);
            });
        })
    }

    static signRefreshToken = async (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                userId
            }
            const refreshKey = process.env.JWT_REFRESH_KEY;
            const options = {
                expiresIn: '1y'
            }
            jwt.sign(payload, refreshKey, options, async (err, token) => {
                if (err) return reject(err);
                await client.set(userId.toString(), token, { EX: 365 * 24 * 60 * 60 });
                resolve(token);
            });
        })
    }
    
    static verifyAccessToken = (req, res, next) => {
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
    }

    static verifyRefreshToken = async (refreshToken) => {
        return new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, payload) => {
                if (err) {
                    // invalid error,...
                    if (err.name === 'JsonWebTokenError') {
                        return new UnauthorizedRequestError("Vui lòng đăng nhập");
                    }
                    // token expired error
                    return new UnauthorizedRequestError("Vui lòng đăng nhập lại");
                }
                const storedRT = await client.get(payload.userId);
                if (storedRT !== refreshToken) {
                    return new UnauthorizedRequestError("Vui lòng đăng nhập");
                }
                resolve(payload);
            })
        })
    }
}

module.exports = JWTService