const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageRecruiter } = require('../../middlewares');
const recruiterNotificationManagementController = require('../../controllers/recruiterNotificationManagement.controller');
const router = express.Router();

// get list notification
router.get('/list_notification', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterNotificationManagementController.getListNotification));
// read notification
router.patch('/read/:notificationId', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterNotificationManagementController.readNotification));
// remove notification
router.delete('/remove/:notificationId', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterNotificationManagementController.removeNotification));
// remove all notification
router.delete('/remove_all', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterNotificationManagementController.removeAllNotification));

module.exports = router;