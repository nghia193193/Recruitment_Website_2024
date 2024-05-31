const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../../images'));
    },
    filename: (req, file, cb) => {
        const fileExtension = file.originalname.split('.').pop();
        cb(null, `${uuidv4()}.${fileExtension}`)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        const error = new Error('Chỉ cho phép file JPG, JPEG, và PNG!');
        error.code = 'LIMIT_FILE_TYPE';
        cb(error, false)
    }
};

const upload = multer({
    storage: fileStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file 5MB
    fileFilter: fileFilter
});

const uploadMiddleware = (req, res, next) => {
    const uploadMultiple = upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'companyLogo', maxCount: 1 },
        { name: 'companyCoverPhoto', maxCount: 1 }
    ]);
    uploadMultiple(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                // Xử lý các lỗi từ multer
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).json({
                        success: false,
                        message: 'Kích thước file phải nhỏ hơn 5MB',
                        statusCode: 413
                    });
                }
                if (err.code === 'LIMIT_FILE_TYPE') {
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                        statusCode: 400
                    });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        success: false,
                        message: 'Field không hợp lệ',
                        statusCode: 400
                    });
                }
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                    statusCode: 400
                });
            }
        }
        next();
    });
};

module.exports = {
    uploadMiddleware
}