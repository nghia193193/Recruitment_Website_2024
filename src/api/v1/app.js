const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const createError = require('http-errors');
// const { fileConfig } = require('./configs/config.fileUpload');
const logEvents = require('./utils/logEvents');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();
// require('./configs/config.coudinary').cloudinaryConfig;
const path = require('path');

const app = express();

app.use(require('./middlewares/uploadFile').uploadMiddleware);

app.use(cors());

app.use(helmet({
    crossOriginResourcePolicy: false,
}));
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
// app.use(fileConfig);
app.use('/images', express.static(path.join(__dirname, '../../images')));
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
    console.log(err);
    logEvents(`${req.connection.localAddress}---${req.url}---${req.method}---${err.message}`);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: "error",
        statusCode: statusCode,
        message: err.message || "Internal server error",
    })
})

require('./dbs/init.mongodb');

module.exports = app;