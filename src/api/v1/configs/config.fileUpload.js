const fileUpload = require('express-fileupload');

const fileConfig = fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: {fileSize: 5*1024*1024},
    safeFileNames: true,
    abortOnLimit: true,
    responseOnLimit: 'Kích thước file tối đa (5MB)',
    preserveExtension: true,
});

module.exports = {
    fileConfig
}