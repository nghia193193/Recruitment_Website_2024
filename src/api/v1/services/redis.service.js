const client = require('../dbs/init.redis');

class RedisService {
    static setPassword = async (email, hashPassword ) => {
        try {
            await client.set(email, hashPassword, { EX: 24 * 60 * 60 }) //expire after 24h
        } catch (error) {
            throw error;
        }
    }

    static setToken = async (email, token ) => {
        try {
            await client.set(email, token, { EX: 60 * 60 }) //expire after 1h
        } catch (error) {
            throw error;
        }
    }

    static getEmailKey = async (email) => {
        try {
            return client.get(email);
        } catch (error) {
            throw error;
        }
    }

    static deleteEmailKey = async (email) => {
        try {
            return client.del(email)
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RedisService;