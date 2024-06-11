const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageRecruiter } = require('../../middlewares');
const recruiterPaymentController = require('../../controllers/recruiterPayment.controller');
const router = express.Router();

// create payment
router.post('/create_payment_url', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterPaymentController.createPayment));
// get vnpay ipn
router.get('/vnpay_ipn', verifyAccessToken, authPageRecruiter, asyncHandler(recruiterPaymentController.getVNPayIPN));

module.exports = router;
