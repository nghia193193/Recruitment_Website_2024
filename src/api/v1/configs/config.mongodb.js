'use strict'

const dev = {
    app: {
        port: process.env.DEV_APP_PORT || 8080
    },
    db: {
        uri: process.env.MONGODB_URI
    }
}

const pro = {
    app: {
        port: process.env.PRO_APP_PORT || 3000
    },
    db: {
        uri: process.env.MONGODB_URI
    }
}

const config = { dev, pro };
const env = process.env.NODE_ENV || "dev";
module.exports = config[env];