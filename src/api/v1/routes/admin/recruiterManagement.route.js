const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageAdmin } = require('../../middlewares');
const adminRecruiterManagementController = require('../../controllers/adminRecruiterManagement.controller');
const router = express.Router();

// get list recruiter
router.get('/list_recruiter', verifyAccessToken, authPageAdmin, asyncHandler(adminRecruiterManagementController.getListRecruiterByAdmin));
// create recruiter
router.post('/create', verifyAccessToken, authPageAdmin, asyncHandler(adminRecruiterManagementController.createRecruiter));
// update recruiter
router.patch('/update/:recruiterId', verifyAccessToken, authPageAdmin, asyncHandler(adminRecruiterManagementController.updateRecruiter));
// get recruiter information
router.get('/information/:recruiterId', verifyAccessToken, authPageAdmin, asyncHandler(adminRecruiterManagementController.getRecruiterInformation));
// approve recruiter
router.patch('/approve/:recruiterId', verifyAccessToken, authPageAdmin, asyncHandler(adminRecruiterManagementController.approveRecruiter));

module.exports = router;