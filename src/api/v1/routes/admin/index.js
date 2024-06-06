const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageAdmin } = require('../../middlewares');
const adminController = require('../../controllers/admin.controller');
const jobController = require('../../controllers/job.controller');
const adminStatisticController = require('../../controllers/adminStatistic.controller');
const recruiterController = require('../../controllers/recruiter.controller');
const router = express.Router();

// get information
router.get('/information', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getInformation));
// get list recruiter
router.get('/recruiters', verifyAccessToken, authPageAdmin, asyncHandler(recruiterController.getListRecruiterByAdmin));
// create recruiter
router.post('/recruiters/create', verifyAccessToken, authPageAdmin, asyncHandler(adminController.createRecruiter));
// update recruiter
router.patch('/recruiters/update/:recruiterId', verifyAccessToken, authPageAdmin, asyncHandler(adminController.updateRecruiter));
// get recruiter information
router.get('/recruiters/:recruiterId', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getRecruiterInformation));
// approve recruiter
router.patch('/recruiters/:recruiterId/approve', verifyAccessToken, authPageAdmin, asyncHandler(adminController.approveRecruiter));
// get list acceptance status
router.get('/acceptance_status', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getListAcceptanceStatus));
// get list job
router.get('/jobs', verifyAccessToken, authPageAdmin, asyncHandler(jobController.getListJobPremiumPrivilege));
// create job
router.post('/jobs/create', verifyAccessToken, authPageAdmin, asyncHandler(adminController.createJob));
// update job
router.patch('/jobs/update/:jobId', verifyAccessToken, authPageAdmin, asyncHandler(adminController.updateJob));
// get job detail
router.get('/jobs/:jobId', verifyAccessToken, authPageAdmin, asyncHandler(jobController.getJobDetail));
// approve job
router.patch('/jobs/:jobId/approve', verifyAccessToken, authPageAdmin, asyncHandler(adminController.approveJob));
// blog
router.get('/blogs', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getListBlog));
router.get('/blogs/:blogId', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getBlogDetail));
router.post('/blogs/create', verifyAccessToken, authPageAdmin, asyncHandler(adminController.createBlog));
router.patch('/blogs/update/:blogId', verifyAccessToken, authPageAdmin, asyncHandler(adminController.updateBlog))
// statistic
router.get('/statistic/total_candidate', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.totalCandidateStatistic));
router.get('/statistic/total_recruiter', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.totalRecruiterStatistic));
router.get('/statistic/total_job', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.totalJobStatistic));

module.exports = router;