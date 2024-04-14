const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageRecruiter } = require('../../middlewares');
const recruiterController = require('../../controllers/recruiter.controller');
const router = express.Router();

// Recruiter get information
router.get('/information', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getInformation));
// Recruiter update information
router.patch('/information', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.updateInformation));

module.exports = router;