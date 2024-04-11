const express = require('express');
const router = express.Router();
const accessRoutes = require('./access');
const recruiterRoutes = require('./recruiter');

router.use('/v1/api', accessRoutes);
router.use('/v1/api/recruiter', recruiterRoutes);

module.exports = router;