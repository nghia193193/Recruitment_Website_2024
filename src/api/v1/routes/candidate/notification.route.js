const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageCandidate } = require('../../middlewares');
const candidateNotificationController = require('../../controllers/candidateNotificationManagement.controller');
const router = express.Router();

// get list notification
router.get('/list_notification', verifyAccessToken, authPageCandidate, asyncHandler(candidateNotificationController.getListNotification));
// read notification
router.patch('/read/:notificationId', verifyAccessToken, authPageCandidate, asyncHandler(candidateNotificationController.readNotification));
// remove notification
router.delete('/remove/:notificationId', verifyAccessToken, authPageCandidate, asyncHandler(candidateNotificationController.removeNotification));
// remove all notification
router.delete('/remove_all', verifyAccessToken, authPageCandidate, asyncHandler(candidateNotificationController.removeAllNotification));

module.exports = router;