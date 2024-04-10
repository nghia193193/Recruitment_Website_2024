const client = require('../dbs/init.redis');

class RedisService {
    static setPassword = async (email, hashPassword ) => {
        try {
            await client.set(email, hashPassword, { EX: 24 * 60 * 60 }) //expire after 24h
        } catch (error) {
            throw error;
        }
    }

    static getPassword = async (email) => {
        try {
            return client.get(email);
        } catch (error) {
            throw error;
        }
    }

    static deletePassword = async (email) => {
        try {
            return client.del(email)
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RedisService;