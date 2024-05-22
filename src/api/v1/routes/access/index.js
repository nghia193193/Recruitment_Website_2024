const express = require('express');
const accessController = require('../../controllers/access.controller');
const { asyncHandler } = require('../../auth/checkAuth');
const router = express.Router();

// Recruiter signup
router.post('/recruiter/signup', asyncHandler(accessController.recruiterSignUp));
// Recruiter verify email
router.post('/recruiter/verify', asyncHandler(accessController.recruiterVerifyEmail));
// Recruiter resend email
router.post('/recruiter/signup/resend_mail', asyncHandler(accessController.recruiterResendVerifyEmail));
// Candidate signup
router.post('/candidate/signup', asyncHandler(accessController.candidateSignUp));
// Candidate verify email
router.post('/candidate/verify', asyncHandler(accessController.candidateVerifyEmail));
// Candidate resend email
router.post('/candidate/signup/resend_mail', asyncHandler(accessController.candidateResendVerifyEmail));
//login
router.post('/login', asyncHandler(accessController.login));
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
router.get('/jobs', asyncHandler(accessController.getListJob));
// get list relevant job by field
router.get('/jobs/:jobId/related_jobs', asyncHandler(accessController.getListRelatedJobByField));
// get list job of recruiter
router.get('/:slug/listjob', asyncHandler(accessController.getListJobOfRecruiter));
// get job detail
router.get('/jobs/:jobId', asyncHandler(accessController.getJobDetail));
// get list recruiter
router.get('/recruiters', asyncHandler(accessController.getListRecruiter));
// get recruiter information
router.get('/recruiters/:slug', asyncHandler(accessController.getRecruiterInformation));

module.exports = router;