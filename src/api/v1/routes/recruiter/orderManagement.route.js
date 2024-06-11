const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageRecruiter, checkPremium } = require('../../middlewares');
const recruiterOderManagementController = require('../../controllers/recruiterOrderManagement.controller');
const router = express.Router();

// view order
router.get('/order_info', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(recruiterOderManagementController.viewOrder));
// cancel order
router.patch('/cancel_order', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(recruiterOderManagementController.cancelOrder));

module.exports = router;
