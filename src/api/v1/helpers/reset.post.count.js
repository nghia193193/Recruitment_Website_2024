'use strict'
const { RecruiterPostLimit } = require('../models/recruiterPostLimit.model');

// Reset post counts của tất cả các nhà tuyển dụng về 0
const resetPostCounts = async () => {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    try {
        const result = await RecruiterPostLimit.updateMany(
            {}, // Reset tất cả bản ghi
            {
                $set: {
                    postCount: 0,
                    lastResetDate: firstDayOfMonth
                }
            }
        );
        console.log(`Reset ${result.modifiedCount} recruiter account`);
    } catch (error) {
        console.error('Error resetting post counts:', error);
    }
};

module.exports = {
    resetPostCounts
}