const schedule = require('node-schedule-tz');
const { resetPostCounts } = require('../helpers/reset.post.count');

class SchedulerService {
    static schedulePostCountReset() {
        // Reset post count vào ngày đầu tiên của mỗi tháng
        const timeZone = 'Asia/Ho_Chi_Minh';
        const cronExpression = '0 0 1 * *';
        schedule.scheduleJob({ rule: cronExpression, tz: timeZone }, async () => {
            console.log('Reset post count job is running');
            resetPostCounts()
                .then(() => console.log('Post counts reset completed successfully'))
                .catch(error => console.error('Unexpected error in reset post count job:', error));
        });
    }
}

module.exports = SchedulerService;