const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageRecruiter, checkPremium } = require('../../middlewares');
const recruiterStatisticController = require('../../controllers/recruiterStatistic.controller');
const router = express.Router();

router.get('/application_statistic', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(recruiterStatisticController.applicationStatistic));
router.get('/application_statistic_by_month', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(recruiterStatisticController.applicationStatisticByMonth));
router.get('/application_statistic_by_year', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(recruiterStatisticController.applicationStatisticByYear));

module.exports = router;