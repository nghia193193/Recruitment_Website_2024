const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageRecruiter } = require('../../middlewares');
const recruiterNotificationController = require('../../controllers/recruiterNotification.controller');
const router = express.Router();

// get list notification
router.get('/list_notification', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterNotificationController.getListNotification));
// read notification
router.patch('/read/:notificationId', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterNotificationController.readNotification));
// remove notification
router.delete('/remove/:notificationId', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterNotificationController.removeNotification));
// remove all notification
router.delete('/remove_all', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterNotificationController.removeAllNotification));

module.exports = router;