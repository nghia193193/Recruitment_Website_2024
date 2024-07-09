const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageRecruiter, checkPremium } = require('../../middlewares');
const recruiterStatisticController = require('../../controllers/recruiterStatistic.controller');
const router = express.Router();

router.get('/application_statistic', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(recruiterStatisticController.applicationStatistic));
router.get('/application_statistic_by_month', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(recruiterStatisticController.applicationStatisticByMonth));
router.get('/application_statistic_by_year', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(recruiterStatisticController.applicationStatisticByYear));
// job statistic
router.get('/job_statistic', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(recruiterStatisticController.jobStatistic));
router.get('/job_statistic_by_month', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(recruiterStatisticController.jobStatisticByMonth));
router.get('/job_statistic_by_year', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(recruiterStatisticController.jobStatisticByYear));
router.get('/job_statistic_home', verifyAccessToken, authPageRecruiter, checkPremium, asyncHandler(recruiterStatisticController.jobHomePageStatistic));

module.exports = router;