const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const createError = require('http-errors');
const logEvents = require('./utils/logEvents');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression({
    level: 6,
    threshold: 100 * 1024, //byte
    filter: (req, res) => {
        if (req.headers['x-no-compress']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(routes);

app.use((req, res, next) => {
    next(createError.NotFound('Page not found'));
})

app.use((err, req, res, next) => {
    logEvents(`${req.connection.localAddress}---${req.url}---${req.method}---${err.message}`);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        status: "error",
        code: statusCode,
        message: err.message || "Internal server error",
    })
})

require('./dbs/init.mongodb');

module.exports = app;