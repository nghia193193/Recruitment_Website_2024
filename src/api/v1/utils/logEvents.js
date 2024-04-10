const fs = require('fs').promises;
const path = require('path');
const { formatInTimeZone } = require('date-fns-tz');

const filePath = path.join(__dirname, '../logs', `log.${formatInTimeZone(new Date(), 'Asia/Ho_Chi_Minh', 'dd_MM_yyy')}`);
const logEvents = async (msg) => {
    try {
        let messageWithNewLine = `${formatInTimeZone(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyy\tHH:mm:ss')} ${msg}\n`;
        await fs.appendFile(filePath, messageWithNewLine);
    } catch (error) {
        console.log(error);
    }
}

module.exports = logEvents;