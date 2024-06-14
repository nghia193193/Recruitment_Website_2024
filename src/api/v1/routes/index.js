const express = require('express');
const router = express.Router();
const accessRoutes = require('./access');
const recruiterRoutes = require('./recruiter');
const recruiterPaymentRoutes = require('./recruiter/payment.route');
const recruiterNotificationManagementRoutes = require('./recruiter/notificationManagement.route');
const recruiterOrderManagementRoutes = require('./recruiter/orderManagement.route');
const adminRoutes = require('./admin');
const adminStatisticRoutes = require('./admin/statistic.route');
const candidateRoutes = require('./candidate');
const candidateNotificationRoutes = require('./candidate/notification.route');
const blogRoutes = require('./blog');

router.use('/v1/api', accessRoutes);
router.use('/v1/api/candidate', candidateRoutes);
router.use('/v1/api/candidate/notifications', candidateNotificationRoutes);
router.use('/v1/api/recruiter', recruiterRoutes);
router.use('/v1/api/recruiter/notifications', recruiterNotificationManagementRoutes);
router.use('/v1/api/recruiter/payment', recruiterPaymentRoutes);
router.use('/v1/api/recruiter/order', recruiterOrderManagementRoutes);
router.use('/v1/api/admin', adminRoutes);
router.use('/v1/api/admin/statistic', adminStatisticRoutes);
router.use('/v1/api/blogs', blogRoutes);

module.exports = router;