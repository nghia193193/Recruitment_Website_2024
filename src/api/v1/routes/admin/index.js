const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageAdmin } = require('../../middlewares');
const adminController = require('../../controllers/admin.controller');
const router = express.Router();

// get information
router.get('/information', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getInformation));
// get list recruiter
router.get('/recruiters', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getListRecruiter));
// change recruiter status
router.patch('/recruiters/:recruiterId/change_status', verifyAccessToken, authPageAdmin, asyncHandler(adminController.changeRecruiterStatus));

module.exports = router;