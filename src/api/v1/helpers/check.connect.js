'use strict'

const mongoose = require('mongoose');
const os = require('os');
const CHECK_SECOND = 5000;
const MAX_CONNECTION = 20;

const countConnect = () => {
    const numCon = mongoose.connections.length;
}

const checkServerOverload = () => {
    setInterval(() => {
        const numCon = mongoose.connections.length;
        const numCore = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;
        console.log("Active connection: ", numCon);
        console.log(`Memory usage: ${memoryUsage/1024/1024} MB`);
        if (numCon > MAX_CONNECTION) {
            console.log("Server Overload");
        }
    }, CHECK_SECOND)
}

module.exports = {
    countConnect,
    checkServerOverload
}