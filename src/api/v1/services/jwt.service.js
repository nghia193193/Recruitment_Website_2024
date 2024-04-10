const jwt = require('jsonwebtoken');
const client = require('../dbs/init.redis');

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
            return next(createError.Unauthorized());
        }
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, payload) => {
            if (err) {
                // invalid error,...
                if (err.name === 'JsonWebTokenError') {
                    return next(createError.Unauthorized());
                }
                // token expired error
                return next(createError.Unauthorized(err.message));
            }
            req.payload = payload;
            next();
        })
    }

    static verifyRefreshToken = async (refreshToken) => {
        return new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN, async (err, payload) => {
                if (err) {
                    // invalid error,...
                    if (err.name === 'JsonWebTokenError') {
                        return reject(createError.Unauthorized());
                    }
                    // token expired error
                    return reject(createError.Unauthorized(err.message));
                }
                const storedRT = await client.get(payload.userId);
                if (storedRT !== refreshToken) {
                    return reject(createError.Unauthorized());
                }
                resolve(payload);
            })
        })
    }
}

module.exports = JWTService