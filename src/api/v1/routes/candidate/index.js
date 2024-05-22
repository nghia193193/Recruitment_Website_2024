const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageCandidate } = require('../../middlewares');
const candidateController = require('../../controllers/candidate.controller');
const router = express.Router();

// get information
router.get('/information', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.getInformation));
// update information
router.patch('/update_information', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.updateInformation));
// update avatar
router.patch('/update_avatar', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.updateAvatar));
// change password
router.post('/change_password', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.changePassword));
// get list favorite job
router.get('/favorite_jobs', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.getListFavoriteJob));
// check favorite job
router.get('/favorite_jobs/check/:jobId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.checkFavoriteJob));
// add favorite job
router.post('/favorite_jobs/add/:jobId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.addFavoriteJob));
// remove favorite job
router.delete('/favorite_jobs/remove/:jobId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.removeFavoriteJob));
// remove all favorite job
router.delete('/favorite_jobs/remove_all', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.removeAllFavoriteJob));
// get list resume
router.get('/resumes', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.getListResume));
// get resume detail
router.get('/resumes/detail/:resumeId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.getResumeDetail));
// add resume
router.post('/resumes/add', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.addResume));
// update resume
router.patch('/resumes/update/:resumeId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.updateResume));
// delete resume
router.delete('/resumes/delete/:resumeId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.deleteResume));
// change status
router.patch('/resumes/change_status/:resumeId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.changeResumeStatus));
// upload certification
router.post('/resumes/upload_certification', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.uploadCertification));
// delete upload certification
router.delete('/resumes/delete_upload_certification/:Id', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.deleteUploadCertification));
// check apply
router.get('/jobs/check_apply/:jobId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.checkApplyJob));
// apply job
router.post('/jobs/apply/:jobId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.applyJob));
// cancel application
router.delete('/jobs/cancel/:jobId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.cancelApplication));
// get list application
router.get('/applications', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.getListApplication));
// get list notification
router.get('/notifications', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.getListNotification));
// read notification
router.patch('/notifications/:notificationId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.readNotification));

module.exports = router;