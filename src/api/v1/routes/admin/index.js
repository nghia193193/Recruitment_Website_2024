const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageAdmin } = require('../../middlewares');
const adminController = require('../../controllers/admin.controller');
const router = express.Router();

// get information
router.get('/information', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getInformation));
// get list recruiter
router.get('/recruiters', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getListRecruiter));
// approve recruiter
router.patch('/recruiters/:recruiterId/approve', verifyAccessToken, authPageAdmin, asyncHandler(adminController.approveRecruiter));
// change recruiter status
router.patch('/recruiters/:recruiterId/change_status', verifyAccessToken, authPageAdmin, asyncHandler(adminController.changeRecruiterStatus));
// get list acceptance status
router.get('/acceptance_status', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getListAcceptanceStatus));
// get list job
router.get('/jobs', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getListJob));
// get job detail
router.get('/jobs/:jobId', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getJobDetail));
// approve job
router.patch('/jobs/:jobId', verifyAccessToken, authPageAdmin, asyncHandler(adminController.approveJob));

module.exports = router;