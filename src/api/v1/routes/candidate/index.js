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
// add favorite job
router.post('/favorite_jobs/add/:jobId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.addFavoriteJob));
// remove favorite job
router.delete('/favorite_jobs/remove/:jobId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.removeFavoriteJob));
// remove all favorite job
router.delete('/favorite_jobs/remove_all', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.removeAllFavoriteJob));
// get list resume
router.get('/resumes', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.getListResume));
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



module.exports = router;