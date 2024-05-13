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
// get list favorite job
router.get('/favorite_jobs', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.getListFavoriteJob));
// add favorite job
router.post('/favorite_jobs/add/:jobId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.addFavoriteJob));
// remove favorite job
router.delete('/favorite_jobs/remove/:jobId', verifyAccessToken, authPageCandidate, asyncHandler(candidateController.removeFavoriteJob));


module.exports = router;