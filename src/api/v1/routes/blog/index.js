const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const blogController = require('../../controllers/blog.controller');
const router = express.Router();

router.get('/', asyncHandler(blogController.getListBlog));
router.get('/:blogId', asyncHandler(blogController.getBlogDetail));

module.exports = router;