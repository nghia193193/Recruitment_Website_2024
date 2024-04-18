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
//login
router.post('/login', asyncHandler(accessController.login));
// get field of activity
router.get('/field_of_activity', asyncHandler(accessController.getFieldOfActivity));
// refresh access token
router.post('/refresh_token', asyncHandler(accessController.refreshAccessToken));
// logout
router.delete('/logout', asyncHandler(accessController.logout));

module.exports = router;