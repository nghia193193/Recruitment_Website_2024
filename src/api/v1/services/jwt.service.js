const jwt = require('jsonwebtoken');
const client = require('../dbs/init.redis');
const { UnauthorizedRequestError } = require('../core/error.response');
require('dotenv').config();

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

    static verifyRefreshToken = async (refreshToken) => {
        return new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, payload) => {
                if (err) {
                    // invalid error,...
                    if (err.name === 'JsonWebTokenError') {
                        return reject(new UnauthorizedRequestError("Token không hợp lệ"));
                    }
                    // token expired error
                    return reject(new UnauthorizedRequestError("Token hết hiệu lực"));
                }
                const storedRT = await client.get(payload.userId);
                if (storedRT !== refreshToken) {
                    return reject(new UnauthorizedRequestError("Token không hợp lệ"));
                }
                resolve(payload);
            })
        })
    }
}

module.exports = JWTService