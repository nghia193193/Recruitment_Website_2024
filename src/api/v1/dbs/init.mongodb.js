"use strict"

const mongoose = require('mongoose');

class Database {
    constructor() {
        this.connect();
    }

    connect(type = "mongodb") {
        if (1 === 1) {
            mongoose.set('debug', true);
            mongoose.set('debug', { color: true })
        }

        mongoose.connect(process.env.MONGODB_URI, {
            minPoolSize: 5,
            maxPoolSize: 100,
            connectTimeoutMS: 3000
        })
            .then(result => {
                console.log('Database connect success')
            })
            .catch(err => console.log(err));
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;