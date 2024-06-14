const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageAdmin } = require('../../middlewares');
const adminStatisticController = require('../../controllers/adminStatistic.controller');
const router = express.Router();

router.get('/total_candidate', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.totalCandidateStatistic));
router.get('/total_recruiter', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.totalRecruiterStatistic));
router.get('/total_job', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.totalJobStatistic));
// revenue
router.get('/revenue', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.caculateRevenue));
// revenue by month
router.get('/revenue_by_month', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.caculateRevenueByMonth));
// revenue by year
router.get('/revenue_by_year', verifyAccessToken, authPageAdmin, asyncHandler(adminStatisticController.caculateRevenueByYear));

module.exports = router;