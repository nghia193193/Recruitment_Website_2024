const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageAdmin } = require('../../middlewares');
const adminController = require('../../controllers/admin.controller');
const router = express.Router();

// get information
router.get('/information', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getInformation));
// get list acceptance status
router.get('/acceptance_status', verifyAccessToken, authPageAdmin, asyncHandler(adminController.getListAcceptanceStatus));

module.exports = router;