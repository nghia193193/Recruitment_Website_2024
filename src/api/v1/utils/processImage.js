const fs = require('fs');
const path = require('path');

const clearImage = (image) => {
    let filePath = path.join(__dirname, '../../../images/', image);
    fs.unlink(filePath, err => console.log(err));
}

module.exports = {
    clearImage
}