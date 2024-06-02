const express = require('express');
const accessController = require('../../controllers/access.controller');
const recruiterController = require('../../controllers/recruiter.controller');
const jobController = require('../../controllers/job.controller');
const { asyncHandler } = require('../../auth/checkAuth');
const router = express.Router();

// login
router.post('/login', asyncHandler(accessController.login));
// forget password
router.post('/forget_password', asyncHandler(accessController.forgetPassword));
// reset password
router.post('/reset_password', asyncHandler(accessController.resetPassword));
// get field of activity
router.get('/field_of_activity', asyncHandler(accessController.getFieldOfActivity));
// get list jobType
router.get('/job_type', asyncHandler(accessController.getJobType));
// get list level requirement
router.get('/level_requirement', asyncHandler(accessController.getLevelRequirement));
// get list experience
router.get('/experience', asyncHandler(accessController.getExperience));
// get list gender requirement
router.get('/gender_requirement', asyncHandler(accessController.getGenderRequirement));
// get list province
router.get('/province', asyncHandler(accessController.getProvince));
// get list work status
router.get('/work_status', asyncHandler(accessController.getWorkStatus));
// refresh access token
router.post('/refresh_token', asyncHandler(accessController.refreshAccessToken));
// logout
router.delete('/logout', asyncHandler(accessController.logout));
// get list job
router.get('/jobs', asyncHandler(jobController.getListJob));
// get list job nổi bật
router.get('/highlighted_jobs', asyncHandler(jobController.getListJobPremiumPrivilegeHome));
// get list relevant job by field
router.get('/jobs/:jobId/related_jobs', asyncHandler(jobController.getListRelatedJobByField));
// get list job of recruiter
router.get('/:slug/listjob', asyncHandler(jobController.getListJobOfRecruiter));
// get job detail
router.get('/jobs/:jobId', asyncHandler(jobController.getJobDetail));
// get list recruiter home page
router.get('/recruiters', asyncHandler(recruiterController.getListRecruiterHomePage));
// get recruiter information
router.get('/recruiters/:slug', asyncHandler(recruiterController.getInformationBySlug));
// get list related recruiter
router.get('/recruiters/:recruiterId/related_recruiter', asyncHandler(recruiterController.getListRelatedRecruiter));

module.exports = router;