const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken } = require('../../services/jwt.service');
const recruiterController = require('../../controllers/recruiter.controller');
const router = express.Router();

// Recruiter get information
router.get('/information', verifyAccessToken, asyncHandler(recruiterController.getInformation));
// Recruiter update information
router.patch('/information', verifyAccessToken, asyncHandler(recruiterController.updateInformation));

module.exports = router;