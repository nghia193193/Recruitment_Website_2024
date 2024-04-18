const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageRecruiter } = require('../../middlewares');
const recruiterController = require('../../controllers/recruiter.controller');
const router = express.Router();

// get information
router.get('/information', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.getInformation));
// update information
router.patch('/information', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.updateInformation));
// create job
router.post('/jobs/create_job', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterController.createJob));

module.exports = router;