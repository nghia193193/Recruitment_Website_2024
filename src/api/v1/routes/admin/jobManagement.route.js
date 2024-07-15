const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageAdmin } = require('../../middlewares');
const adminJobManagementController = require('../../controllers/adminJobManagement.controller');
const jobController = require('../../controllers/job.controller');
const router = express.Router();

// get list job
router.get('/list_job', verifyAccessToken, authPageAdmin, asyncHandler(jobController.getListJobPremiumPrivilege));
// create job
router.post('/create', verifyAccessToken, authPageAdmin, asyncHandler(adminJobManagementController.createJob));
// update job
router.patch('/update/:jobId', verifyAccessToken, authPageAdmin, asyncHandler(adminJobManagementController.updateJob));
// get job detail
router.get('/detail/:jobId', verifyAccessToken, authPageAdmin, asyncHandler(jobController.getJobDetail));

module.exports = router;