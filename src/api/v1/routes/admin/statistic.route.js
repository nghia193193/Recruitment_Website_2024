const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageAdmin } = require('../../middlewares');
const adminStatisticController = require('../../controllers/adminStatistic.controller');
const router = express.Router();

router.get('/total_candidate', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.totalCandidateStatistic));
router.get('/total_recruiter', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.totalRecruiterStatistic));
router.get('/total_job', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.totalJobStatistic));
router.get('/total_blog', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.totalBlogStatistic));

// revenue statistic
router.get('/revenue', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.caculateRevenue));
router.get('/revenue_by_month', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.caculateRevenueByMonth));
router.get('/revenue_by_year', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.caculateRevenueByYear));

// application statistic
router.get('/application_statistic', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.applicationStatistic));
router.get('/application_statistic_by_month', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.applicationStatisticByMonth));
router.get('/application_statistic_by_year', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.applicationStatisticByYear));

// job statistic
router.get('/job_statistic', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.jobStatistic));
router.get('/job_statistic_by_month', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.jobStatisticByMonth));
router.get('/job_statistic_by_year', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.jobStatisticByYear));

// recruiter statistic
router.get('/recruiter_statistic_by_year', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.recruiterStatisticByYear));

module.exports = router;