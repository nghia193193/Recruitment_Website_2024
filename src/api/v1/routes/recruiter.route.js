'use strict'

const { Router } = require('express');

const router = Router();

router.get('/', (req, res, next) => {
    console.log('Hello Recruiter')
})

module.exports = router;