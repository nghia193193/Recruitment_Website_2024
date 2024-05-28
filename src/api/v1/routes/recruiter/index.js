const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter } = require('../../middlewares');
const recruiterController = require('../../controllers/recruiter.controller');
const router = express.Router();

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
router.post('/jobs/create_job', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.createJob));
// get list waiting job
router.get('/jobs/waiting_jobs', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.getListWaitingJob));
// get list accepted job
router.get('/jobs/accepted_jobs', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.getListAcceptedJob));
// get list declined job
router.get('/jobs/declined_jobs', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.getListDeclinedJob));
// get list nearing expiration job
router.get('/jobs/nearing_expiration_jobs', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.getListNearingExpirationdJob));
// get list expired job
router.get('/jobs/expired_jobs', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.getListExpiredJob));
// get job status
router.get('/jobs/status', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.getJobStatus));
// get job detail
router.get('/jobs/:jobId', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.getJobDetail));
// update job
router.patch('/jobs/:jobId/update_job', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.updateJob));
// change job status
router.patch('/jobs/:jobId/change_status', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.changeJobStatus));
// get list job application experience
router.get('/jobs/applications/:jobId/list_experience', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.getListJobApplicationExperience));
// get list job application
router.get('/jobs/applications/:jobId', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.getListJobApplication));
// get application detail
router.get('/jobs/applications/detail/:applicationId', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.getApplicationDetail));
// approve application
router.patch('/jobs/applications/approve/:applicationId', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.approveApplication));
// get list application status
router.get('/application_status', verifyAccessToken, authPageRecruiter, checkAcceptedRecruiter, asyncHandler(recruiterController.getListApplicationStatus));
// get list notification
router.get('/notifications', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getListNotification));
// read notification
router.patch('/notifications/:notificationId', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.readNotification));
// check out
router.post('/create_payment_url', verifyAccessToken, authPageRecruiter, recruiterController.checkOut);

module.exports = router;