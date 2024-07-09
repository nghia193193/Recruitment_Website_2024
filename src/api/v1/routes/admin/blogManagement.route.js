const express = require('express');
const { asyncHandler } = require('../../auth/checkAuth');
const { verifyAccessToken, authPageAdmin } = require('../../middlewares');
const adminBlogManagementController = require('../../controllers/adminBlogManagement.controller');
const router = express.Router();

router.get('/list_blog', verifyAccessToken, authPageAdmin, asyncHandler(adminBlogManagementController.getListBlog));
router.get('/detail/:blogId', verifyAccessToken, authPageAdmin, asyncHandler(adminBlogManagementController.getBlogDetail));
router.post('/create', verifyAccessToken, authPageAdmin, asyncHandler(adminBlogManagementController.createBlog));
router.patch('/update/:blogId', verifyAccessToken, authPageAdmin, asyncHandler(adminBlogManagementController.updateBlog));

module.exports = router;