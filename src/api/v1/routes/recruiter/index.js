const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageRecruiter, checkPremium } = require('../../middlewares');
const applicationController = require('../../controllers/application.controller');
const recruiterController = require('../../controllers/recruiter.controller');
const resumeController = require('../../controllers/resume.controller');
const favoriteResumeController = require('../../controllers/favoriteResume.controller');
const router = express.Router();

// signup
router.post('/signup', asyncHandler(recruiterController.signUp));
// verify email
router.post('/verify', asyncHandler(recruiterController.verifyEmail));
// resend email
router.post('/signup/resend_mail', asyncHandler(recruiterController.resendVerifyEmail));
// get information
router.get('/information', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getInformation));
// update information
router.patch('/update_information', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.updateInformation));
// update avatar
router.patch('/update_avatar', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.updateAvatar));
// update profile
router.patch('/update_profile', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.updateProfile));
// update company information
router.patch('/update_company_information', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.updateCompany));
// change password
router.post('/change_password', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.changePassword));
// create job
router.post('/jobs/create_job', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.createJob));
// get list waiting job
router.get('/jobs/waiting_jobs', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getListWaitingJob));
// get list accepted job
router.get('/jobs/accepted_jobs', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getListAcceptedJob));
// get list declined job
router.get('/jobs/declined_jobs', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getListDeclinedJob));
// get list nearing expiration job
router.get('/jobs/nearing_expiration_jobs', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getListNearingExpirationdJob));
// get list expired job
router.get('/jobs/expired_jobs', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getListExpiredJob));
// get job status
router.get('/jobs/status', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getJobStatus));
// get job detail
router.get('/jobs/:jobId', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getJobDetail));
// update job
router.patch('/jobs/:jobId/update_job', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.updateJob));
// change job status
router.patch('/jobs/:jobId/change_status', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.changeJobStatus));
// get list job application experience
router.get('/jobs/applications/:jobId/list_experience', verifyAccessToken, authPageRecruiter, asyncHandler(applicationController.getListJobApplicationExperience));
// get list job application
router.get('/jobs/applications/:jobId', verifyAccessToken, authPageRecruiter, asyncHandler(applicationController.getListJobApplication));
// get application detail
router.get('/jobs/applications/detail/:applicationId', verifyAccessToken, authPageRecruiter, asyncHandler(applicationController.getApplicationDetail));
// approve application
router.patch('/jobs/applications/approve/:applicationId', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.approveApplication));
// get list application status
router.get('/application_status', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getListApplicationStatus));
// get list notification
router.get('/notifications', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getListNotification));
// read notification
router.patch('/notifications/:notificationId', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.readNotification));
// create payment
router.post('/create_payment_url', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.createPayment));
// get vnpay ipn
router.get('/vnpay_ipn', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getVNPayIPN));
// check premium Account
router.get('/check_premium_account', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.checkPremiumAccount));
// cancel order
router.patch('/cancel_order', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(recruiterController.cancelOrder));
// advanced search premium
router.get('/list_advanced_resume', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(resumeController.advancedSearchForPremium));
// resume detail
router.get('/list_advanced_resume/:resumeId', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(resumeController.getResumeDetail));
// list favorite resume
router.get('/favorite_resumes/list', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(favoriteResumeController.getListFavoriteResume));
router.get('/favorite_resumes/check/:resumeId', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(favoriteResumeController.checkFavoriteResume));
router.post('/favorite_resumes/add/:resumeId', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(favoriteResumeController.addFavoriteResume));
router.delete('/favorite_resumes/remove/:resumeId', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(favoriteResumeController.removeFavoriteResume));
router.delete('/favorite_resumes/remove_all', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(favoriteResumeController.removeAllFavoriteResume));


module.exports = router;