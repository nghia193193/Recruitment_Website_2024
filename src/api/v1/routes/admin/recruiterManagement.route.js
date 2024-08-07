const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageAdmin } = require('../../middlewares');
const adminRecruiterManagementController = require('../../controllers/adminRecruiterManagement.controller');
const router = express.Router();

// get list recruiter
router.get('/list_recruiter', verifyAccessToken, authPageAdmin, asyncHandler(adminRecruiterManagementController.getListRecruiterByAdmin));
// get list all recruiter
router.get('/list_all_recruiter', verifyAccessToken, authPageAdmin, asyncHandler(adminRecruiterManagementController.getListAllRecruiter));
// create recruiter
router.post('/create', verifyAccessToken, authPageAdmin, asyncHandler(adminRecruiterManagementController.createRecruiter));
// update recruiter
router.patch('/update/:recruiterId', verifyAccessToken, authPageAdmin, asyncHandler(adminRecruiterManagementController.updateRecruiter));
// get recruiter information
router.get('/information/:recruiterId', verifyAccessToken, authPageAdmin, asyncHandler(adminRecruiterManagementController.getRecruiterInformation));
// approve recruiter
router.patch('/approve/:recruiterId', verifyAccessToken, authPageAdmin, asyncHandler(adminRecruiterManagementController.approveRecruiter));
// get list banned recruiter
router.get('/list_banned_recruiter', verifyAccessToken, authPageAdmin, asyncHandler(adminRecruiterManagementController.getListBannedRecruiter));
// unban recruiter
router.patch('/unban/:recruiterId', verifyAccessToken, authPageAdmin, asyncHandler(adminRecruiterManagementController.unbanRecruiter));

module.exports = router;