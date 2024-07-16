const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageAdmin } = require('../../middlewares');
const adminJobManagementController = require('../../controllers/adminJobManagement.controller');
const jobController = require('../../controllers/job.controller');
const reportController = require('../../controllers/report.controller');
const router = express.Router();

// get list job
router.get('/list_job', verifyAccessToken, authPageAdmin, asyncHandler(jobController.getListJobPremiumPrivilege));
// get list reported job
router.get('/list_reported_job', verifyAccessToken, authPageAdmin, asyncHandler(adminJobManagementController.getListReportedJob));
// create job
router.post('/create', verifyAccessToken, authPageAdmin, asyncHandler(adminJobManagementController.createJob));
// update job
router.patch('/update/:jobId', verifyAccessToken, authPageAdmin, asyncHandler(adminJobManagementController.updateJob));
// get job detail
router.get('/detail/:jobId', verifyAccessToken, authPageAdmin, asyncHandler(adminJobManagementController.getJobDetail));
// get list report of job
router.get('/:jobId/reports', verifyAccessToken, authPageAdmin, asyncHandler(reportController.getListReportOfJob));
// read report
router.get('/:jobId/reports/:reportId', verifyAccessToken, authPageAdmin, asyncHandler(reportController.readReport));
// ban job
router.patch('/:jobId/ban', verifyAccessToken, authPageAdmin, asyncHandler(adminJobManagementController.banJob));

module.exports = router;